"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  fetchPlaceDetails,
  fetchPlaceSuggestions,
  type PlaceSuggestion,
  type ResolvedPlace,
} from "@/lib/api-client";

/**
 * The single address entry point for the host and admin surfaces.
 *
 * You pick a place or you do not proceed. There is no free-text path: the
 * component reports a value only once a real Place has been resolved, which is
 * what stops rows like `Lagos Ibadan` with city `Lekki` ever being written
 * again.
 *
 * Billing note: one `sessionToken` covers every keystroke of a single entry
 * plus the Details call that closes it. A fresh token is minted only after a
 * selection resolves, or after the field is cleared — minting one per keystroke
 * would multiply the bill by the length of the address.
 */

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

const newSessionToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type AddressPickerProps = {
  /** The currently selected address, if any. */
  value?: ResolvedPlace | null;
  onChange: (place: ResolvedPlace | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Shown under the field — used for server-side validation messages. */
  error?: string;
};

export default function AddressPicker({
  value,
  onChange,
  label = "Address",
  placeholder = "Start typing an address…",
  disabled,
  required,
  error,
}: AddressPickerProps) {
  const [query, setQuery] = useState(value?.formattedAddress ?? "");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const sessionTokenRef = useRef<string>(newSessionToken());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  // Keeps the input in step when a parent loads an existing address in.
  useEffect(() => {
    if (value?.formattedAddress) {
      setQuery(value.formattedAddress);
    }
  }, [value?.formattedAddress]);

  // Debounced lookup. The request that resolves last is not necessarily the one
  // that was sent last, so stale responses are discarded by generation counter
  // rather than trusted to arrive in order.
  const generationRef = useRef(0);

  useEffect(() => {
    if (disabled) return;
    const trimmed = query.trim();

    // Nothing to look up once the query already matches the selection.
    if (value && trimmed === value.formattedAddress) {
      setSuggestions([]);
      return;
    }
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLookupError(null);
      return;
    }

    const generation = ++generationRef.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const { suggestions: results } = await fetchPlaceSuggestions(
          trimmed,
          sessionTokenRef.current
        );
        if (generation !== generationRef.current) return;
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
        setLookupError(results.length === 0 ? "No matching places found." : null);
      } catch {
        if (generation !== generationRef.current) return;
        setSuggestions([]);
        setLookupError("Address lookup is unavailable right now.");
      } finally {
        if (generation === generationRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, disabled, value]);

  // Close on outside click.
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const select = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setOpen(false);
      setLoading(true);
      setLookupError(null);
      try {
        const { place } = await fetchPlaceDetails(suggestion.placeId, sessionTokenRef.current);
        setQuery(place.formattedAddress);
        onChange(place);
        // The session is closed by the Details call; the next entry needs a new one.
        sessionTokenRef.current = newSessionToken();
        setSuggestions([]);
      } catch {
        setLookupError("Could not load that address. Please pick it again.");
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setLookupError(null);
    sessionTokenRef.current = newSessionToken();
    onChange(null);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const message = error ?? lookupError;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label ? (
        <label className="mb-1 block text-sm font-medium">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <Input
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value);
            // Typing after a selection invalidates it — the parent must not keep
            // coordinates that no longer match what is on screen.
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(suggestions.length > 0)}
          onKeyDown={onKeyDown}
        />
        {query && !disabled ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear address"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => void select(suggestion)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-gray-100" : "bg-white"
                }`}
              >
                <span className="block font-medium">{suggestion.mainText || suggestion.text}</span>
                {suggestion.secondaryText ? (
                  <span className="block text-xs text-gray-500">{suggestion.secondaryText}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {loading ? <p className="mt-1 text-xs text-gray-500">Searching…</p> : null}
      {message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null}

      {/* Confirms to the host that a real place was captured, not just text. */}
      {value?.latitude != null && value?.longitude != null ? (
        <p className="mt-1 text-xs text-green-600">
          Pinned at {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
