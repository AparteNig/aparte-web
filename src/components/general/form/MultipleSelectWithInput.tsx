/* eslint-disable prefer-destructuring */
/* eslint-disable no-nested-ternary */
import { SelectOptionType } from "@/utils/types";
import { CheckIcon, ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import Label from "./Label";

const SelectWithInput = forwardRef<
  HTMLInputElement,
  {
    options: SelectOptionType[];
    onChange: (value: SelectOptionType[] | SelectOptionType | null) => void;
    className?: string;
    formClassName?: string;
    label?: string;
    labelClassName?: string;
    inputClassName?: string;
    inputParentClassName?: string;
    listClassName?: string;
    listButtonClassName?: string;
    id?: string;
    error?: string;
    multiple?: boolean;
    showSelected?: boolean;
    value: SelectOptionType[] | SelectOptionType | null;
    placeholder?: string;
    allowCustom?: boolean;
  }
>(
  (
    {
      options,
      onChange,
      className,
      formClassName,
      label,
      labelClassName,
      inputClassName,
      inputParentClassName,
      listClassName,
      listButtonClassName,
      showSelected,
      multiple,
      id,
      error,
      value,
      placeholder = "Select option",
      allowCustom,
      ...props
    },
    ref
  ) => {
    if (!Array.isArray(options)) {
      options = [];
    }
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<
      SelectOptionType[] | SelectOptionType | null
    >(multiple ? [] : null);
    const [showList, setShowList] = useState(false);
    const [isOnList, setIsOnList] = useState(false);

    const setValue = () => {
      if (!multiple && !Array.isArray(selected)) {
        setQuery(selected?.label ?? "");
      }
    };

    const filteredOptions = !multiple
      ? options
      : query === ""
      ? options
      : options.filter((person) => {
          return person.label.toLowerCase().includes(query.toLowerCase());
        });

    useEffect(() => {
      if (multiple) {
        if (
          value &&
          Array.isArray(value) &&
          Array.isArray(selected) &&
          value?.length !== selected?.length
        ) {
          setSelected(value);
        }
      }

      if (!multiple) {
        if (
          value &&
          !Array.isArray(value) &&
          !Array.isArray(selected) &&
          value?.value !== selected?.value
        ) {
          setSelected(value);
          setQuery(value?.label ?? "");
        }

        if (!value) {
          setQuery("");
          setSelected(null);
        }
      }
    }, [value, selected, multiple]);

    return (
      <div className={`flex flex-col gap-3 relative ${className}`}>
        <div className={`${formClassName} flex flex-col gap-2 relative`}>
          {label && (
            <Label
              className={`${labelClassName} cursor-pointer`}
              htmlFor={id || label ? label?.split(" ").join("") : "input"}
            >
              {label}
            </Label>
          )}
          <div className="relative flex flex-col gap-2">
            <div className={`relative flex flex-wrap gap-3`}>
              <input
                ref={ref}
                id={id || label ? label?.split(" ").join("") : "input"}
                onClick={() => {
                  setShowList((prevState) => {
                    if (prevState) {
                      setValue();
                    }
                    return !prevState;
                  });
                }}
                onKeyDown={(e) => {
                  // console.log("keyCode", e.key);
                  if (
                    e?.code?.toLowerCase() === "enter" ||
                    e?.key?.toLowerCase() === "enter"
                  ) {
                    e.preventDefault();
                    if (allowCustom) {
                      const option = { label: query, value: query };
                      const isSelected =
                        Array.isArray(selected) &&
                        !!selected?.find(
                          (optionDetails) =>
                            optionDetails?.value === option?.value
                        );
                      if (multiple) {
                        const newValue = Array.isArray(selected)
                          ? isSelected
                            ? selected?.filter(
                                (opt) => opt.value !== option.value
                              )
                            : [...selected, option]
                          : [];
                        setSelected(newValue);

                        if (onChange && typeof onChange === "function") {
                          onChange(newValue);
                        }
                      }
                      if (!multiple) {
                        setSelected(option);
                        if (onChange && typeof onChange === "function") {
                          onChange(option);
                        }
                        setQuery(option?.label);
                      }
                      setQuery("");
                    }
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  if (!showList) {
                    setShowList(true);
                  }
                }}
                // onFocus={() => {
                //   setShowList(true);
                // }}
                onBlur={() => {
                  if (!isOnList) {
                    setValue();
                    setShowList(false);
                  }
                }}
                className={` ${inputClassName}  ${
                  error ? "!border-red-600" : ""
                } py-3 px-5 border outline-none rounded-md w-full h-full ${
                  allowCustom ? "" : "cursor-pointer"
                }`}
                value={query}
                placeholder={placeholder}
                {...props}
              />
              <span className="top-1/2 -translate-y-1/2 right-4 absolute text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            {showList && (
              <ul
                onMouseEnter={() => {
                  setIsOnList(true);
                }}
                onMouseLeave={() => {
                  setIsOnList(false);
                }}
                className={`${listClassName} top-[3rem] absolute w-full z-10 border rounded- bg-white shadow-md max-h-[200px] overflow-auto custom-scroll`}
              >
                {filteredOptions &&
                  Array.isArray(filteredOptions) &&
                  filteredOptions.map((option) => {
                    let isSelected = false;
                    if (multiple) {
                      isSelected =
                        Array.isArray(selected) &&
                        !!selected?.find(
                          (optionDetails) =>
                            optionDetails?.value === option?.value
                        );
                    }

                    if (!multiple) {
                      isSelected =
                        !Array.isArray(selected) &&
                        selected?.value === option?.value;
                    }
                    return (
                      <li
                        onClick={() => {
                          if (!multiple) {
                            setSelected(isSelected ? null : option);
                            if (onChange && typeof onChange === "function") {
                              onChange(isSelected ? null : option);
                            }
                            setQuery(option?.label);
                          }

                          if (multiple) {
                            const newValue = Array.isArray(selected)
                              ? isSelected
                                ? selected?.filter(
                                    (opt) => opt.value !== option.value
                                  )
                                : [...selected, option]
                              : [];
                            setSelected(newValue);

                            if (onChange && typeof onChange === "function") {
                              onChange(newValue);
                            }
                          }
                          setShowList(false);
                        }}
                        className={`${listButtonClassName} w-full justify-between items-center gap-2 flex px-2 py-2 cursor-pointer hover:bg-slate-100`}
                        key={option?.value}
                      >
                        <span className={`${isSelected ? "opacity-50" : ""}`}>
                          {option?.label}
                        </span>
                        {isSelected && (
                          <span className="inline-flex w-3.5 h-3.5 items-center justify-center bg-primary text-white rounded-full">
                            <CheckIcon size={10} />
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
            {showSelected && multiple && (
              <div className="flex flex-wrap w-full gap-3">
                {Array.isArray(selected) &&
                  selected?.map((option) => (
                    <span
                      onClick={() => {
                        setSelected((prevState) =>
                          Array.isArray(prevState)
                            ? prevState.filter(
                                (opt) => opt.value !== option.value
                              )
                            : []
                        );
                      }}
                      key={option?.value}
                      className="bg-slate-100 text-black py-1 px-2 text-xs rounded-full cursor-pointer"
                    >
                      {option?.label}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  }
);

SelectWithInput.displayName = "Input Select";

export default SelectWithInput;
