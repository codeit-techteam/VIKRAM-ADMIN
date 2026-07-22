const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash on Delhivery",
  cash: "Cash on Delhivery",
  cod: "Cash on Delhivery",
  cash_on_delhivery: "Cash on Delhivery",
  upi: "Pay with UPI",
  UPI: "Pay with UPI",
  cards: "Pay with Cards",
  BANK: "Bank Transfer",
  bank_transfer: "Bank Transfer",
  CREDIT: "Credit",
  credit: "Credit",
};

export function formatPaymentMethodLabel(method: string): string {
  if (!method) return "—";

  const direct = PAYMENT_METHOD_LABELS[method];
  if (direct) return direct;

  const upper = PAYMENT_METHOD_LABELS[method.toUpperCase()];
  if (upper) return upper;

  return method.replace(/_/g, " ");
}
