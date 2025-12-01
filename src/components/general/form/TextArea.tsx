import React, { forwardRef } from "react";
import Label from "./Label";
import { InputElementProps } from "@/utils/types";

const TextArea = forwardRef<HTMLTextAreaElement, InputElementProps>(
  (
    {
      label,
      id,
      className,
      inputClassName,
      inputParentClassName,
      formClassName,
      type,
      placeholder,
      labelClassName,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${className} flex flex-col gap-2`}>
        <div className={`${formClassName} flex flex-col gap-2`}>
          {label && (
            <Label
              className={`${labelClassName}`}
              htmlFor={id || label || "input-rad"}
            >
              {label}
            </Label>
          )}

          <div
            className={`${inputParentClassName} w-full relative flex items-stretch justify-center`}
          >
            <textarea
              {...props}
              title={label}
              id={id || label || "input-rad"}
              ref={ref}
              placeholder={placeholder || label || "Input field"}
              className={`peer/radio-btn border ${
                error ? "border-red-600" : ""
              } py-3 px-5 outline-none rounded-md w-full h-full ${inputClassName} `}
            ></textarea>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = "Text area field";

export default TextArea;
