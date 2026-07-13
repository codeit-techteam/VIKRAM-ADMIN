import type { HubTransfer } from "@/types/hub-transfer.types";
import {
  formatHubTransferCurrency,
  formatHubTransferDateTime,
  HUB_TRANSFER_STATUS_LABELS,
} from "@/mock/hub-transfers";

export function printHubTransferDispatchSlip(transfer: HubTransfer): void {
  const productRows = transfer.products
    .map(
      (product) => `
      <tr>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.reservedQuantity}</td>
        <td>${(product.weightKg * product.quantity).toLocaleString("en-IN")} kg</td>
        <td>${formatHubTransferCurrency(product.amount)}</td>
      </tr>`,
    )
    .join("");

  const timelineRows = transfer.timeline
    .map(
      (event) => `
      <tr>
        <td>${event.title}</td>
        <td>${event.updatedBy}</td>
        <td>${formatHubTransferDateTime(event.timestamp)}</td>
        <td>${event.remarks ?? "—"}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Dispatch Slip ${transfer.transferId}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 28px; color: #1a1a1a; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    section { margin-bottom: 22px; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; font-size: 11px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field label { display: block; font-size: 11px; color: #94a3b8; }
    .field span { font-weight: 600; }
  </style>
</head>
<body>
  <h1>Hub Dispatch Slip — ${transfer.transferId}</h1>
  <p class="meta">Printed ${new Date().toLocaleString("en-IN")}</p>

  <section>
    <h2>Customer</h2>
    <div class="grid">
      <div class="field"><label>Name</label><span>${transfer.customerName}</span></div>
      <div class="field"><label>Mobile</label><span>${transfer.customerMobile}</span></div>
      <div class="field"><label>Address</label><span>${transfer.deliveryAddress}, ${transfer.pincode}</span></div>
      <div class="field"><label>Status</label><span>${
        transfer.isDelayed &&
        transfer.status !== "DELIVERED" &&
        transfer.status !== "CANCELLED"
          ? "Delayed"
          : HUB_TRANSFER_STATUS_LABELS[transfer.status]
      }</span></div>
    </div>
  </section>

  <section>
    <h2>Order Summary</h2>
    <table>
      <thead><tr><th>Product</th><th>Qty</th><th>Reserved</th><th>Weight</th><th>Amount</th></tr></thead>
      <tbody>${productRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Logistics</h2>
    <div class="grid">
      <div class="field"><label>Hub</label><span>${transfer.hubName}</span></div>
      <div class="field"><label>Driver</label><span>${transfer.driverName ?? "—"}</span></div>
      <div class="field"><label>Vehicle</label><span>${transfer.vehicleNumber ?? "—"}</span></div>
      <div class="field"><label>Expected Delivery</label><span>${formatHubTransferDateTime(transfer.expectedDelivery)}</span></div>
    </div>
  </section>

  <section>
    <h2>Timeline</h2>
    <table>
      <thead><tr><th>Status</th><th>Updated By</th><th>Timestamp</th><th>Remarks</th></tr></thead>
      <tbody>${timelineRows}</tbody>
    </table>
  </section>
</body>
</html>`;

  const printWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=900,height=700",
  );
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function printHubTransferInvoice(transfer: HubTransfer): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${transfer.orderId}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 32px; }
    h1 { font-size: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .total { font-size: 18px; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Tax Invoice</h1>
  <p>Order: ${transfer.orderId} · Customer: ${transfer.customerName}</p>
  <p>Hub: ${transfer.hubName} · Date: ${formatHubTransferDateTime(transfer.orderDate)}</p>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>
      ${transfer.products
        .map(
          (p) =>
            `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatHubTransferCurrency(p.unitPrice)}</td><td>${formatHubTransferCurrency(p.amount)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <p class="total">Grand Total: ${formatHubTransferCurrency(transfer.totalAmount)}</p>
</body>
</html>`;

  const printWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=800,height=600",
  );
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
