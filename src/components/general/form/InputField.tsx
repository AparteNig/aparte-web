import React, { forwardRef, useState } from "react";
import Label from "./Label";
import { InputFieldProps } from "@/utils/types";
import { UploadIcon } from "@/assets/icons";
import Image from "next/image";

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
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
      RightIcon,
      buttonTitle,
      LeftIcon,
      rightButtonTitle,
      leftButtonTitle,
      leftButtonClassName,
      rightButtonClassName,
      labelClassName,
      rightIconAction,
      leftIconAction,
      iconProps,
      error,
      imagePreview,
      ...props
    },
    ref
  ) => {
    const [showPassword] = useState<boolean>(false);
    const buttonClassName =
      "absolute top-1/2 -translate-y-1/2 z-10 h-full px-4";
    let allIconProps = {
      ...iconProps,
    };

    if (error) {
      allIconProps = {
        ...iconProps,
        color: "rgba(255,0,0, .7)",
      };
    }

    // const handleRightIconClick = () => {
    //   if (type === "password") {
    //     setShowPassword(!showPassword);
    //   }
    //   if (rightIconAction && typeof rightIconAction === "function") {
    //     rightIconAction();
    //   }
    // };
    return (
      <div className={`${className} flex flex-col gap-2`}>
        <div className={`${formClassName} flex flex-col gap-2`}>
          {label && (
            <Label
              className={labelClassName}
              htmlFor={id || label || "input-rad"}
            >
              {label}
            </Label>
          )}

          <div
            className={`${inputParentClassName}  w-full relative flex items-stretch justify-center`}
          >
            {LeftIcon && (
              <button
                type="button"
                onClick={() => {
                  if (leftIconAction && typeof leftIconAction === "function") {
                    leftIconAction();
                  }
                }}
                className={`${leftButtonClassName || buttonClassName} left-0`}
                title={leftButtonTitle || buttonTitle}
              >
                <LeftIcon {...allIconProps} />
              </button>
            )}

            {imagePreview && (
              <div
                className={`${
                  leftButtonClassName || buttonClassName
                } h-10 w-20 rounded-s-[18px] overflow-hidden  left-0`}
              >
                {imagePreview.startsWith("data:application/pdf") ? (
                  <iframe
                    src={imagePreview}
                    className="h-full w-full"
                    title="PDF Preview"
                  ></iframe>
                ) : (
                  <Image
                    src={imagePreview}
                    fill
                    alt="Preview"
                    priority={false}
                    sizes="32px"
                    className=" w-[6.4rem] object-cover"
                  />
                )}
              </div>
            )}

            {type === "file" ? (
              <>
                <input
                  {...props}
                  title={label}
                  id={id || label || "input-rad"}
                  ref={ref}
                  type="file"
                  className={`${inputClassName} rounded-xl file:hidden peer/radio-btn border border-[#C1C7D0] ${
                    error ? "!border-red-600" : ""
                  } py-3 px-5 ${LeftIcon ? "pl-12" : ""} ${
                    imagePreview ? "pl-20" : ""
                  }  ${
                    RightIcon ? "pr-12" : ""
                  } outline-none rounded-md w-full h-full`}
                  placeholder={placeholder || "Choose file"}
                />
                <button
                  type="button"
                  className={`${
                    rightButtonClassName || buttonClassName
                  } right-0`}
                >
                  <UploadIcon />
                </button>
              </>
            ) : (
              <input
                {...props}
                title={label}
                id={id || label || "input-rad"}
                ref={ref}
                type={
                  type === "password" && !showPassword ? "password" : "text"
                }
                placeholder={placeholder || label || "Input field"}
                className={`${inputClassName}  rounded-xl peer/radio-btn border border-[#C1C7D0] ${
                  error ? "!border-red-600" : ""
                } py-3 px-5 ${LeftIcon || imagePreview ? "pl-12" : ""} ${
                  RightIcon ? "pr-12" : ""
                } outline-none rounded-md w-full h-full`}
              />
            )}
            {RightIcon && (
              <button
                type="button"
                onClick={() => {
                  if (
                    rightIconAction &&
                    typeof rightIconAction === "function"
                  ) {
                    rightIconAction();
                  }
                }}
                className={`${
                  rightButtonClassName || buttonClassName
                } right-0 `}
                title={rightButtonTitle || buttonTitle}
              >
                <RightIcon {...allIconProps} />
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
