export function downloadCsvFile(filename: string, content: Blob | string) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
