import React, { useEffect, useState } from "react";
import InputField from "./InputField";
import { formatCurrency } from "@/utils/functions";

interface CurrencyInputProps {
  value: number | string | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  currency?: number | string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "Enter amount",
  disabled = false,
  currency = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    setInputValue(formatCurrency(cleanedValue));
    onChange(parseFloat(cleanedValue) || 0);
  };

  useEffect(() => {
    setInputValue(formatCurrency(value));
  }, [value]);

  return (
    <InputField
      type="text"
      value={inputValue ? `${currency} ${inputValue}` : ""}
      onChange={handleInputChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default CurrencyInput;
