const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatCurrency = (
  amount: number,
  options?: { showSymbol?: boolean },
): string => {
  if (options?.showSymbol === false) {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return INR_FORMATTER.format(amount);
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[₹,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};
