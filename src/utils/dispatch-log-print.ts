import type { DispatchLog } from "@/types/dispatch-log.types";
import {
  DISPATCH_LOG_STATUS_LABELS,
  formatDispatchLogCurrency,
  formatDispatchLogDateTime,
} from "@/mock/dispatch-logs";

export function printDispatchLogSlip(log: DispatchLog): void {
  const productRows = log.orderLines
    .map(
      (line) =>
        `<tr><td>${line.name}</td><td>${line.sku}</td><td>${line.quantity} ${line.unit}</td></tr>`,
    )
    .join("");

  const timelineRows = log.timeline
    .map(
      (event) =>
        `<tr><td>${event.title}</td><td>${event.updatedBy}</td><td>${formatDispatchLogDateTime(event.timestamp)}</td><td>${event.isManual ? "Manual" : "System"}</td><td>${event.remarks ?? "—"}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Dispatch Slip ${log.dispatchId}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 28px; color: #1a1a1a; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    section { margin-bottom: 20px; }
    h2 { font-size: 12px; text-transform: uppercase; color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; font-size: 11px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field label { display: block; font-size: 11px; color: #94a3b8; }
    .field span { font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #f1f5f9; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Dispatch Slip — ${log.dispatchId}</h1>
  <p class="meta">Printed ${new Date().toLocaleString("en-IN")} · Manual tracking only</p>

  <section>
    <h2>Customer & Order</h2>
    <div class="grid">
      <div class="field"><label>Customer</label><span>${log.customerName}</span></div>
      <div class="field"><label>Order</label><span>${log.orderId}</span></div>
      <div class="field"><label>Hub</label><span>${log.hubName}</span></div>
      <div class="field"><label>Status</label><span class="badge">${
        log.isDelayed && log.status !== "DELIVERED"
          ? "Delayed"
          : DISPATCH_LOG_STATUS_LABELS[log.status]
      }</span></div>
    </div>
  </section>

  <section>
    <h2>Order Lines</h2>
    <table><thead><tr><th>Product</th><th>SKU</th><th>Qty</th></tr></thead><tbody>${productRows}</tbody></table>
    <p><strong>Order Value:</strong> ${formatDispatchLogCurrency(log.orderValue)}</p>
  </section>

  <section>
    <h2>Logistics</h2>
    <div class="grid">
      <div class="field"><label>Vehicle</label><span>${log.vehicleNumber ?? "—"}</span></div>
      <div class="field"><label>Driver</label><span>${log.driverName ?? "—"}</span></div>
      <div class="field"><label>Dispatch Time</label><span>${log.dispatchTime ? formatDispatchLogDateTime(log.dispatchTime) : "—"}</span></div>
      <div class="field"><label>Last Updated</label><span>${formatDispatchLogDateTime(log.lastUpdated)}</span></div>
    </div>
  </section>

  <section>
    <h2>Timeline</h2>
    <table><thead><tr><th>Status</th><th>Updated By</th><th>Timestamp</th><th>Type</th><th>Remarks</th></tr></thead><tbody>${timelineRows}</tbody></table>
  </section>

  ${log.deliveryNotes ? `<section><h2>Delivery Notes</h2><p>${log.deliveryNotes}</p></section>` : ""}
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
