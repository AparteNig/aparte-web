export const formatCurrency = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numeric =
    typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));

  if (Number.isNaN(numeric)) {
    return "";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(numeric);
};
