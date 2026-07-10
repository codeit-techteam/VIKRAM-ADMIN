import type { CePayment } from "@/features/customer-executive/types";

export function exportPaymentsCsv(
  payments: CePayment[],
  filename?: string,
): void {
  const headers = [
    "Order Number",
    "Customer",
    "Phone",
    "Amount",
    "Paid",
    "Due",
    "Status",
    "Link Status",
    "Reminders",
    "Due Date",
  ];

  const rows = payments.map((p) => [
    p.orderNumber,
    p.customerName,
    p.customerPhone,
    p.amount,
    p.paidAmount,
    p.amount - p.paidAmount,
    p.status,
    p.linkStatus,
    p.reminderCount,
    new Date(p.dueDate).toLocaleDateString("en-IN"),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ?? `ce-payments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
