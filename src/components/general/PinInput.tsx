import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Image from "next/image";
import Button from "./Button";
import { LockPng } from "@/assets/images/png";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  isLocked?: boolean;
  attemptsRemaining?: number;
  maxAttempts?: number;
  loading?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  containerClassName?: string;
  btnText?: string;
}

const PinInput = forwardRef(
  (
    {
      length = 4,
      onComplete,
      isLocked = false,
      attemptsRemaining = 3,
      maxAttempts = 3,
      loading = false,
      disabled = false,
      inputClassName = "",
      containerClassName = "",
      btnText = "Confirm",
    }: PinInputProps,
    ref
  ) => {
    const [pin, setPin] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      resetPin: () => {
        setPin(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      },
    }));

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      if (isLocked || disabled) {
        return;
      }
      const { value } = e.target;
      if (/^\d$/.test(value)) {
        setPin((prev) => {
          const newPin = [...prev];
          newPin[index] = value;
          return newPin;
        });
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      if (isLocked || disabled) {
        return;
      }
      switch (e.key) {
        case "Backspace":
          setPin((prev) => {
            const newPin = [...prev];
            newPin[index] = "";
            return newPin;
          });
          if (index > 0) {
            inputRefs.current[index - 1]?.focus();
          }
          break;
        case "ArrowLeft":
          if (index > 0) {
            inputRefs.current[index - 1]?.focus();
          }
          break;
        case "ArrowRight":
          if (index < length - 1) {
            inputRefs.current[index + 1]?.focus();
          }
          break;
        case "Enter":
          if (!pin.some((digit) => !digit)) {
            onComplete(pin.join(""));
          }
          break;
        default:
          "";
      }
    };

    return (
      <div className={`space-y-4 ${containerClassName}`}>
        <div className="flex justify-center  items-center !w-full h-24">
          <Image
            src={LockPng}
            alt="Enter PIN"
            width={32}
            height={32}
            priority={false}
            quality={100}
            className=" w-[6.4rem] object-cover"
          />
        </div>
        <div className="flex items-center justify-center gap-6 py-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              maxLength={1}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-16 h-16 text-center text-xl border rounded-2xl border-primary ${inputClassName}`}
              disabled={isLocked || disabled || loading}
              aria-label={`PIN Digit ${index + 1}`}
            />
          ))}
        </div>
        {isLocked && (
          <p className="text-sm text-red-500 text-center">
            Too many failed attempts. Try again later.
          </p>
        )}
        {!isLocked && attemptsRemaining < maxAttempts && (
          <p className="text-sm text-red-500 text-center">
            {attemptsRemaining} attempts remaining.
          </p>
        )}
        <Button
          onClick={() => onComplete(pin.join(""))}
          type="primary"
          className="w-full mt-4"
          disabled={
            pin.some((digit) => !digit) || loading || isLocked || disabled
          }
        >
          {btnText}
        </Button>
      </div>
    );
  }
);

PinInput.displayName = "PinInput";

export default PinInput;
