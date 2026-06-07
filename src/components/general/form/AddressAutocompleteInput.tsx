"use client";

import { forwardRef, useEffect, useRef } from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { attachPlacesAutocomplete, type PlaceResult } from "./address-autocomplete";

type AddressAutocompleteInputProps = InputProps & {
  onPlaceSelected?: (formatted: string, place: PlaceResult) => void;
};

const AddressAutocompleteInput = forwardRef<HTMLInputElement, AddressAutocompleteInputProps>(
  ({ onPlaceSelected, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      let cleanup: (() => void) | null = null;
      let active = true;
      const init = async () => {
        cleanup = await attachPlacesAutocomplete(inputRef.current, (formatted, place) => {
          if (!active || !inputRef.current) return;
          if (onChange) {
            const event = {
              target: inputRef.current,
              currentTarget: inputRef.current,
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }
          onPlaceSelected?.(formatted, place);
        });
      };
      init();
      return () => {
        active = false;
        cleanup?.();
      };
    }, [onChange, onPlaceSelected]);

    return (
      <Input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }
        }}
      />
    );
  }
);

AddressAutocompleteInput.displayName = "AddressAutocompleteInput";

export default AddressAutocompleteInput;
