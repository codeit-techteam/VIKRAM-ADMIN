export const DELIVERY_FEE = 0;
export const GST_RATE = 0.18;

/** Loyalty discount is calculated by the backend (1 pt = ₹0.01). Do not fake a %. */
export function computeOrderTotals(subtotal: number, gstRate = GST_RATE) {
  const gst = Math.round(subtotal * gstRate * 100) / 100;
  const loyaltyDiscount = 0;
  const grandTotal = subtotal + gst + DELIVERY_FEE - loyaltyDiscount;
  return {
    subtotal,
    gst,
    deliveryFee: DELIVERY_FEE,
    loyaltyDiscount,
    grandTotal,
  };
}

export function calculateOrderTotal(
  items: { unitPrice: number; quantity: number }[],
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  return computeOrderTotals(subtotal);
}
