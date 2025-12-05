import React, { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/assets/icons";
interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: string;
  id?: string;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  options: Option[];
  placeholder?: string;
  error?: string;
}

const DropdownSelect = forwardRef<HTMLSelectElement, DropdownSelectProps>(
  (
    {
      label,
      id,
      className = "",
      selectClassName = "",
      options,
      placeholder,
      labelClassName,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${className} flex flex-col gap-2`}>
        {label && (
          <label htmlFor={id || label} className={`${labelClassName}`}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            {...props}
            id={id || label}
            ref={ref}
            className={`${selectClassName} appearance-none w-full px-4 py-2 cursor-pointer pr-8 rounded-xl border outline-none  ${
              error ? "!border-red-500" : "border-[#C1C7D0]"
            } bg-white `}
            defaultValue=""
          >
            <option value="" disabled hidden>
              {placeholder || "Select an option"}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

DropdownSelect.displayName = "DropdownSelect";

export default DropdownSelect;
