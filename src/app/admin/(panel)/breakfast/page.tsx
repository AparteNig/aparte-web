"use client";

import { useState } from "react";

import Button from "@/components/general/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useBreakfastOptionsQuery,
  useCreateBreakfastOptionMutation,
  useUpdateBreakfastOptionMutation,
} from "@/hooks/admin/use-admin-data";
import {
  uploadBreakfastImage,
  type BreakfastCategory,
  type BreakfastOptionRow,
} from "@/lib/api-client";

/**
 * The breakfast catalogue.
 *
 * Guests are shown three of these per morning, drawn from the active pool, so
 * this page controls what can appear rather than what does. Retiring a dish
 * takes it out of the draw without deleting it — past orders reference these
 * rows and a guest's history should not lose its meal because the menu moved.
 */

const CATEGORIES: { value: BreakfastCategory; label: string }[] = [
  { value: "local", label: "Nigerian" },
  { value: "continental", label: "Continental" },
  { value: "protein", label: "High protein" },
  { value: "vegan", label: "Vegan" },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

type Draft = {
  name: string;
  description: string;
  price: string;
  category: BreakfastCategory;
  imageKey: string;
  imagePreview: string;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  price: "",
  category: "local",
  imageKey: "",
  imagePreview: "",
};

function ImageField({
  draft,
  setDraft,
  busy,
  setBusy,
  onError,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onError: (m: string | null) => void;
}) {
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onError(null);
    try {
      const { key, url } = await uploadBreakfastImage(file);
      setDraft({ ...draft, imageKey: key, imagePreview: url });
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not upload that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-semibold text-slate-800">Photograph</span>
      <span className="block text-xs font-normal text-slate-500">
        Guests choose by sight as much as by name.
      </span>
      <div className="flex items-center gap-3">
        {draft.imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.imagePreview}
            alt=""
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0])}
          className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
      </div>
    </label>
  );
}

function OptionCard({ option }: { option: BreakfastOptionRow }) {
  const update = useUpdateBreakfastOptionMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    name: option.name,
    description: option.description,
    price: String(option.price),
    category: option.category,
    imageKey: "",
    imagePreview: option.imageUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const price = Number(draft.price);
    if (!draft.name.trim()) return setError("A dish needs a name.");
    if (!Number.isInteger(price) || price <= 0) {
      return setError("Price must be a whole number of naira above zero.");
    }
    try {
      await update.mutateAsync({
        id: option.id,
        patch: {
          name: draft.name.trim(),
          description: draft.description.trim(),
          price,
          category: draft.category,
          ...(draft.imageKey ? { imageKey: draft.imageKey } : {}),
        },
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  };

  const toggleActive = async () => {
    setError(null);
    try {
      await update.mutateAsync({ id: option.id, patch: { isActive: !option.isActive } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update.");
    }
  };

  return (
    <Card className={option.isActive ? "" : "opacity-60"}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex gap-3">
          {option.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={option.imageUrl}
              alt=""
              className="h-20 w-20 flex-none rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 flex-none items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
              No photo
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{option.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{option.description}</p>
            <p className="mt-1 text-xs text-slate-500">
              {CATEGORIES.find((c) => c.value === option.category)?.label ?? option.category} ·{" "}
              <span className="font-medium text-slate-700">{naira(option.price)}</span> per extra
              serving
            </p>
          </div>
          <span
            className={`h-fit whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${
              option.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {option.isActive ? "In the draw" : "Retired"}
          </span>
        </div>

        {editing && (
          <div className="space-y-3 border-t border-slate-200 pt-3">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Dish name"
            />
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Short description"
            />
            <div className="flex gap-3">
              <Input
                type="number"
                min="1"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="Extra serving price"
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as BreakfastCategory })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <ImageField
              draft={draft}
              setDraft={setDraft}
              busy={busy}
              setBusy={setBusy}
              onError={setError}
            />
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-2">
          {editing ? (
            <>
              <Button type="primary" onClick={save} disabled={update.isPending || busy}>
                {update.isPending ? "Saving…" : "Save"}
              </Button>
              <Button type="transparent" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button type="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button type="transparent" onClick={toggleActive} disabled={update.isPending}>
                {option.isActive ? "Retire" : "Restore"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminBreakfastPage() {
  const { data: options, isLoading, isError } = useBreakfastOptionsQuery();
  const create = useCreateBreakfastOptionMutation();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCount = (options ?? []).filter((o) => o.isActive).length;

  const submit = async () => {
    setError(null);
    const price = Number(draft.price);
    if (!draft.name.trim()) return setError("A dish needs a name.");
    if (!Number.isInteger(price) || price <= 0) {
      return setError("Price must be a whole number of naira above zero.");
    }
    if (!draft.imageKey) return setError("Add a photograph — guests pick by sight.");
    try {
      await create.mutateAsync({
        name: draft.name.trim(),
        description: draft.description.trim(),
        price,
        category: draft.category,
        imageKey: draft.imageKey,
      });
      setDraft(EMPTY);
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that dish.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Breakfast menu</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Guests are shown three of these each morning, drawn from whatever is in the
            draw. One breakfast per apartment per day is complimentary — not one per
            guest — and the price here is what every serving beyond that costs.
          </p>
          {options && (
            <p className="mt-2 text-xs text-slate-500">
              {activeCount} in the draw · {options.length - activeCount} retired
            </p>
          )}
        </div>
        {!adding && (
          <Button type="primary" onClick={() => setAdding(true)}>
            Add a dish
          </Button>
        )}
      </header>

      {adding && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Dish name — e.g. Akara & Pap"
            />
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Short description a guest will read"
            />
            <div className="flex gap-3">
              <Input
                type="number"
                min="1"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="Extra serving price"
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as BreakfastCategory })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <ImageField
              draft={draft}
              setDraft={setDraft}
              busy={busy}
              setBusy={setBusy}
              onError={setError}
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="primary" onClick={submit} disabled={create.isPending || busy}>
                {create.isPending ? "Adding…" : "Add to the menu"}
              </Button>
              <Button
                type="transparent"
                onClick={() => {
                  setAdding(false);
                  setDraft(EMPTY);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading the menu…</p>}
      {isError && (
        <p className="text-sm text-rose-600">Could not load the menu. Refresh to retry.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {(options ?? []).map((option) => (
          <OptionCard key={option.id} option={option} />
        ))}
      </div>
    </div>
  );
}
