import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";

import Label from "./Label";

type CountryOption = {
  name: string;
  code: string;
  dialCode: string;
};

const DEFAULT_COUNTRIES: CountryOption[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234" },
  { name: "Ghana", code: "GH", dialCode: "+233" },
  { name: "Kenya", code: "KE", dialCode: "+254" },
  { name: "South Africa", code: "ZA", dialCode: "+27" },
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971" },
];

const flagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));

type PhoneInputProps = {
  label?: string;
  error?: string;
  countries?: CountryOption[];
  selectAriaLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;

const stripDialCode = (dialCode: string, value: string) => {
  if (value.startsWith(dialCode)) {
    return value.slice(dialCode.length);
  }
  const fallback = value.match(/^\+\d{1,4}/);
  if (fallback?.[0]) {
    return value.slice(fallback[0].length);
  }
  return value;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    label,
    error,
    countries = DEFAULT_COUNTRIES,
    selectAriaLabel = "Country code",
    value = "",
    onChange,
    className,
    ...inputProps
  },
  ref,
) {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0]);

  const valueCountry = useMemo(() => {
    return countries.find((country) => value.startsWith(country.dialCode));
  }, [countries, value]);

  useEffect(() => {
    if (valueCountry && valueCountry.code !== selectedCountry.code) {
      setSelectedCountry(valueCountry);
    }
  }, [selectedCountry.code, valueCountry]);

  const nationalNumber = useMemo(() => {
    return stripDialCode(selectedCountry.dialCode, value);
  }, [selectedCountry.dialCode, value]);

  const handleCountryChange = (countryCode: string) => {
    const nextCountry =
      countries.find((country) => country.code === countryCode) ?? countries[0];
    setSelectedCountry(nextCountry);
    const stripped = stripDialCode(selectedCountry.dialCode, value);
    onChange?.(`${nextCountry.dialCode}${stripped}`);
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/[^\d]/g, "");
    onChange?.(`${selectedCountry.dialCode}${digitsOnly}`);
  };

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {label && <Label>{label}</Label>}
      <div
        className={clsx(
          "flex items-stretch rounded-2xl border border-[#C1C7D0] bg-white",
          error && "!border-red-600",
        )}
      >
        <select
          aria-label={selectAriaLabel}
          className="flex  items-center gap-1 rounded-s-2xl border-r border-[#C1C7D0] bg-slate-50 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          value={selectedCountry.code}
          onChange={(event) => handleCountryChange(event.target.value)}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {`${flagEmoji(country.code)} ${country.dialCode}`}
            </option>
          ))}
        </select>
        <input
          {...inputProps}
          ref={ref}
          value={nationalNumber}
          onChange={handleNumberChange}
          className="flex-1 rounded-e-2xl bg-transparent px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          inputMode="tel"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

export default PhoneInput;
