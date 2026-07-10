import type { HubRequisitionDetailView } from "@/mock/hub-requisitions";
import { formatHubRequisitionPrintDate } from "@/mock/hub-requisitions";
import { formatRequisitionQuantity } from "@/mock/requisitions";

export function printHubRequisition(detail: HubRequisitionDetailView): void {
  const { requisition, hubManager, hubCity, hubRegion, inventory, timeline } =
    detail;

  const approvedQty =
    requisition.approvedQty ??
    (requisition.status !== "PENDING" && requisition.status !== "REJECTED"
      ? requisition.requestedQty
      : null);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${requisition.requestId} — Hub Requisition</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 32px; color: #1a1a1a; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    section { margin-bottom: 24px; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    th { background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field label { display: block; font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
    .field span { font-size: 14px; font-weight: 600; }
    .reason { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; color: #475569; }
    .timeline-item { border-left: 2px solid #e2e8f0; padding-left: 12px; margin-bottom: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Hub Requisition ${requisition.requestId}</h1>
  <p class="meta">Printed on ${new Date().toLocaleString("en-IN")}</p>

  <section>
    <h2>Hub Information</h2>
    <div class="grid">
      <div class="field"><label>Hub</label><span>${requisition.hubName}</span></div>
      <div class="field"><label>Manager</label><span>${hubManager}</span></div>
      <div class="field"><label>City</label><span>${hubCity}</span></div>
      <div class="field"><label>Region</label><span>${hubRegion}</span></div>
      <div class="field"><label>Destination Warehouse</label><span>${requisition.destinationWarehouse}</span></div>
      <div class="field"><label>Status</label><span>${requisition.status}</span></div>
    </div>
  </section>

  <section>
    <h2>Requested Materials</h2>
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Material</th>
          <th>Requested Qty</th>
          <th>Approved Qty</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${requisition.sku}</td>
          <td>${requisition.material}${requisition.materialSpec ? ` (${requisition.materialSpec})` : ""}</td>
          <td>${formatRequisitionQuantity(requisition.requestedQty, requisition.unit)}</td>
          <td>${approvedQty != null ? formatRequisitionQuantity(approvedQty, requisition.unit) : "—"}</td>
          <td>${requisition.priority}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Inventory Context</h2>
    <div class="grid">
      <div class="field"><label>Current Inventory</label><span>${
        inventory
          ? formatRequisitionQuantity(inventory.currentQty, inventory.unit)
          : "—"
      }</span></div>
      <div class="field"><label>Minimum Stock</label><span>${
        inventory
          ? formatRequisitionQuantity(inventory.minimumStock, inventory.unit)
          : "—"
      }</span></div>
    </div>
  </section>

  <section>
    <h2>Reason</h2>
    <div class="reason">${requisition.requestReason}</div>
  </section>

  <section>
    <h2>Approval Timeline</h2>
    ${timeline
      .map(
        (entry) => `
      <div class="timeline-item">
        <strong>${entry.title}</strong>
        <div style="font-size:12px;color:#64748b;">${formatHubRequisitionPrintDate(entry.timestamp)} · ${entry.actor}</div>
        ${entry.description ? `<div style="font-size:13px;margin-top:4px;">${entry.description}</div>` : ""}
      </div>`,
      )
      .join("")}
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
