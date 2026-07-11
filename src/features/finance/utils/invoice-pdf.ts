import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { FinanceInvoice } from "@/features/finance/types";
import { formatGST } from "@/utils/format-gst";

const BRAND_ORANGE: [number, number, number] = [255, 107, 0];
const DARK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [100, 116, 139];
const LIGHT_BG: [number, number, number] = [248, 249, 251];
const BORDER: [number, number, number] = [229, 231, 235];

// Standard PDF fonts have no ₹ glyph, so amounts use the "Rs." prefix.
const inr = (amount: number) =>
  `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;

function buildInvoicePdf(invoice: FinanceInvoice): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentRight = pageWidth - margin;

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Bajriwala", margin, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "BuildQuick India Pvt. Ltd. - B2B Construction Procurement",
    margin,
    19,
  );
  doc.text(
    "www.buildquick.in  |  support@buildquick.in  |  +91 1800 200 4400",
    margin,
    24,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", contentRight, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoice.invoiceNumber, contentRight, 22, { align: "right" });

  // ── Status pill ──────────────────────────────────────────────
  const statusColors: Record<string, [number, number, number]> = {
    Pending: [245, 158, 11],
    Paid: [34, 197, 94],
    Cancelled: [239, 68, 68],
  };
  const statusColor = statusColors[invoice.status] ?? MUTED;
  const statusLabel = invoice.status.toUpperCase();
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  const statusWidth = doc.getTextWidth(statusLabel) + 10;
  doc.setFillColor(...statusColor);
  doc.roundedRect(
    contentRight - statusWidth,
    34,
    statusWidth,
    7.5,
    3.5,
    3.5,
    "F",
  );
  doc.setTextColor(255, 255, 255);
  doc.text(statusLabel, contentRight - statusWidth / 2, 39, {
    align: "center",
  });

  // ── Invoice meta (left) ──────────────────────────────────────
  let y = 40;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const meta: Array<[string, string]> = [
    ["Invoice Date", format(new Date(invoice.invoiceDate), "dd MMM yyyy")],
    ["Order ID", `#${invoice.orderNumber}`],
    ["Fulfillment Hub", invoice.hubName],
    ["Customer Executive", invoice.executiveName],
  ];
  if (invoice.paymentDate) {
    meta.push([
      "Payment Date",
      format(new Date(invoice.paymentDate), "dd MMM yyyy"),
    ]);
  }
  if (invoice.paymentMethod) {
    meta.push(["Payment Method", invoice.paymentMethod]);
  }

  for (const [label, value] of meta) {
    doc.setTextColor(...MUTED);
    doc.text(`${label}:`, margin, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + 34, y);
    doc.setFont("helvetica", "normal");
    y += 5;
  }

  // ── Bill To panel ────────────────────────────────────────────
  y = Math.max(y + 4, 72);
  const panelTop = y;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, panelTop, pageWidth - margin * 2, 30, 2, 2, "FD");

  doc.setTextColor(...BRAND_ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILL TO", margin + 5, panelTop + 6.5);

  doc.setTextColor(...DARK);
  doc.setFontSize(10.5);
  doc.text(invoice.customerName, margin + 5, panelTop + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(invoice.customerCompany, margin + 5, panelTop + 18);
  doc.text(invoice.customerAddress, margin + 5, panelTop + 23, {
    maxWidth: (pageWidth - margin * 2) / 2 + 10,
  });

  doc.text(`Phone: ${invoice.customerPhone}`, contentRight - 5, panelTop + 13, {
    align: "right",
  });
  doc.text(`Email: ${invoice.customerEmail}`, contentRight - 5, panelTop + 18, {
    align: "right",
  });
  if (invoice.customerGst) {
    doc.text(
      `GSTIN: ${formatGST(invoice.customerGst)}`,
      contentRight - 5,
      panelTop + 23,
      { align: "right" },
    );
  }

  // ── Products table ───────────────────────────────────────────
  autoTable(doc, {
    startY: panelTop + 36,
    margin: { left: margin, right: margin },
    head: [["#", "Product", "SKU", "Qty", "Rate", "GST %", "Amount"]],
    body: invoice.products.map((p, i) => [
      String(i + 1),
      p.name,
      p.sku,
      `${p.quantity} ${p.unit}`,
      inr(p.unitPrice),
      `${p.gstRate}%`,
      inr(p.amount),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      textColor: DARK,
      cellPadding: 3,
      lineColor: BORDER,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: BRAND_ORANGE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 8 },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", cellWidth: 14 },
      6: { halign: "right", fontStyle: "bold" },
    },
  });

  const tableEnd =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? panelTop + 60;

  // ── GST summary + totals ─────────────────────────────────────
  const summaryTop = tableEnd + 8;
  const colWidth = (pageWidth - margin * 2 - 6) / 2;

  // GST box (left)
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, summaryTop, colWidth, 34, 2, 2, "FD");
  doc.setTextColor(...BRAND_ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GST SUMMARY", margin + 5, summaryTop + 6.5);

  const gstRows: Array<[string, string]> = [
    ["Taxable Amount", inr(invoice.gstSummary.taxableAmount)],
    ["CGST", inr(invoice.gstSummary.cgst)],
    ["SGST", inr(invoice.gstSummary.sgst)],
    ["Total GST", inr(invoice.gstSummary.totalGst)],
  ];
  let gy = summaryTop + 12.5;
  doc.setFontSize(8.5);
  for (const [label, value] of gstRows) {
    const isTotal = label === "Total GST";
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setTextColor(...(isTotal ? DARK : MUTED));
    doc.text(label, margin + 5, gy);
    doc.setTextColor(...DARK);
    doc.text(value, margin + colWidth - 5, gy, { align: "right" });
    gy += 5.5;
  }

  // Totals box (right)
  const totalsX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(totalsX, summaryTop, colWidth, 34, 2, 2, "FD");
  doc.setTextColor(...BRAND_ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ORDER SUMMARY", totalsX + 5, summaryTop + 6.5);

  const totalRows: Array<[string, string]> = [
    ["Subtotal", inr(invoice.orderSummary.subtotal)],
    ["Delivery Charges", inr(invoice.orderSummary.deliveryCharges)],
    ["GST", inr(invoice.orderSummary.gstTotal)],
  ];
  if (invoice.orderSummary.discount > 0) {
    totalRows.splice(1, 0, [
      "Discount",
      `- ${inr(invoice.orderSummary.discount)}`,
    ]);
  }
  let ty = summaryTop + 12.5;
  doc.setFontSize(8.5);
  for (const [label, value] of totalRows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, totalsX + 5, ty);
    doc.setTextColor(...DARK);
    doc.text(value, totalsX + colWidth - 5, ty, { align: "right" });
    ty += 5.5;
  }

  // Grand total band
  const grandTop = summaryTop + 38;
  doc.setFillColor(...BRAND_ORANGE);
  doc.roundedRect(totalsX, grandTop, colWidth, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("GRAND TOTAL", totalsX + 5, grandTop + 7);
  doc.setFontSize(11);
  doc.text(
    inr(invoice.orderSummary.grandTotal),
    totalsX + colWidth - 5,
    grandTop + 7,
    {
      align: "right",
    },
  );

  // Amount verification / cancellation note (left, under GST box)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  if (invoice.status === "Paid" && invoice.verifiedAt) {
    doc.text(
      `Payment verified by ${invoice.verifiedBy ?? "Finance Team"} on ${format(
        new Date(invoice.verifiedAt),
        "dd MMM yyyy, hh:mm a",
      )}`,
      margin,
      grandTop + 7,
    );
  } else if (invoice.status === "Cancelled" && invoice.cancellationReason) {
    doc.text(`Cancelled: ${invoice.cancellationReason}`, margin, grandTop + 7, {
      maxWidth: colWidth,
    });
  }

  // ── Footer ───────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...BORDER);
  doc.line(margin, pageHeight - 24, contentRight, pageHeight - 24);

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "Terms: Payment due upon receipt. Goods once sold will not be taken back. Subject to jurisdiction of local courts.",
    margin,
    pageHeight - 18,
  );
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    margin,
    pageHeight - 13,
  );
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_ORANGE);
  doc.text("Bajriwala - BuildQuick India", contentRight, pageHeight - 13, {
    align: "right",
  });

  return doc;
}

export function downloadInvoicePdf(invoice: FinanceInvoice): void {
  const doc = buildInvoicePdf(invoice);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

export function viewInvoicePdf(invoice: FinanceInvoice): void {
  const doc = buildInvoicePdf(invoice);
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank", "noopener,noreferrer");
}
