import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = "Sheet1",
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { header: string; key: keyof T }[],
  title?: string,
): void => {
  const doc = new jsPDF();

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 20);
  }

  autoTable(doc, {
    startY: title ? 30 : 20,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => String(row[col.key] ?? ""))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [255, 107, 0] },
  });

  doc.save(`${filename}.pdf`);
};
