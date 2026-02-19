"use client";

import { forwardRef, useEffect, useRef } from "react";

import InputField from "@/components/general/form/InputField";
import type { InputFieldProps } from "@/utils/types";
import { attachPlacesAutocomplete } from "./address-autocomplete";

type AddressAutocompleteInputFieldProps = InputFieldProps & {
  onPlaceSelected?: (formatted: string) => void;
};

const AddressAutocompleteInputField = forwardRef<
  HTMLInputElement,
  AddressAutocompleteInputFieldProps
>(({ onPlaceSelected, onChange, ...props }, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let active = true;
    const init = async () => {
      cleanup = await attachPlacesAutocomplete(inputRef.current, (formatted) => {
        if (!active || !inputRef.current) return;
        if (onChange) {
          const event = {
            target: inputRef.current,
            currentTarget: inputRef.current,
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
        onPlaceSelected?.(formatted);
      });
    };
    init();
    return () => {
      active = false;
      cleanup?.();
    };
  }, [onChange, onPlaceSelected]);

  return (
    <InputField
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
});

AddressAutocompleteInputField.displayName = "AddressAutocompleteInputField";

export default AddressAutocompleteInputField;
