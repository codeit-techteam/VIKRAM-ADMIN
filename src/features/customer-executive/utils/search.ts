import type { CeCustomer, CeOrder } from "@/features/customer-executive/types";

export function searchOrders(
  orders: CeOrder[],
  customers: CeCustomer[],
  query: string,
): CeOrder | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();

  const byNumber = orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === lower ||
      o.orderNumber.toLowerCase().includes(lower) ||
      o.id === trimmed,
  );
  if (byNumber) return byNumber;

  const normalizedPhone = trimmed.replace(/\D/g, "").slice(-10);
  if (normalizedPhone.length >= 10) {
    const customer = customers.find((c) =>
      c.phone.replace(/\D/g, "").slice(-10).includes(normalizedPhone),
    );
    if (customer) {
      return orders
        .filter((o) => o.customerId === customer.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
    }
  }

  const customerByName = customers.find(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.company.toLowerCase().includes(lower),
  );
  if (customerByName) {
    return orders
      .filter((o) => o.customerId === customerByName.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
  }

  return undefined;
}

export function getLatestOrderForCustomer(
  orders: CeOrder[],
  customerId: string,
): CeOrder | undefined {
  return orders
    .filter((o) => o.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
}
