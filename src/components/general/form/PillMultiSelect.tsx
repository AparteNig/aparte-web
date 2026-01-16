import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PillMultiSelectProps = {
  label?: string;
  helperText?: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  addButtonLabel?: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const PillMultiSelect = ({
  label,
  helperText,
  options,
  selected,
  onChange,
  allowCustom = false,
  customPlaceholder = "Add custom item",
  addButtonLabel = "Add",
}: PillMultiSelectProps) => {
  const [customValue, setCustomValue] = useState("");

  const orderedOptions = useMemo(() => {
    const selectedNormalized = selected.map((option) => option.trim()).filter(Boolean);
    const unselectedOptions = options.filter(
      (option) =>
        !selectedNormalized.some(
          (selectedOption) => normalize(selectedOption) === normalize(option),
        ),
    );
    return [...selectedNormalized, ...unselectedOptions];
  }, [options, selected]);

  const toggleOption = (option: string) => {
    const alreadyIncluded = selected.some(
      (selectedOption) => normalize(selectedOption) === normalize(option),
    );
    if (alreadyIncluded) {
      onChange(
        selected.filter(
          (selectedOption) => normalize(selectedOption) !== normalize(option),
        ),
      );
      return;
    }
    onChange([...selected, option]);
  };

  const handleAddCustom = () => {
    if (!customValue.trim()) return;
    const alreadyIncluded = selected.some(
      (selectedOption) => normalize(selectedOption) === normalize(customValue),
    );
    if (!alreadyIncluded) {
      onChange([...selected, customValue.trim()]);
    }
    setCustomValue("");
  };

  return (
    <div className="space-y-3">
      {label && <p className="font-semibold text-slate-800">{label}</p>}
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      <div className="flex flex-wrap gap-2 text-sm">
        {orderedOptions.map((option) => {
          const isSelected = selected.some(
            (selectedOption) => normalize(selectedOption) === normalize(option),
          );
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "rounded-full border px-3 py-1 font-semibold transition",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50",
              )}
              aria-pressed={isSelected}
            >
              {isSelected ? option : `+ ${option}`}
            </button>
          );
        })}
        {orderedOptions.length === 0 && (
          <p className="text-xs text-slate-500">No options available.</p>
        )}
      </div>
      {allowCustom && (
        <div className="flex flex-wrap gap-2">
          <Input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder={customPlaceholder}
            className="flex-1 min-w-[180px]"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {addButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default PillMultiSelect;
