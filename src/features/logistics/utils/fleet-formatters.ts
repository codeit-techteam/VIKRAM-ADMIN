import { formatPhone } from "@/utils/format-phone";

/** Format raw input like HR55AN1024 → HR-55-AN-1024 */
export function formatVehicleNumber(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  if (cleaned.length <= 6)
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 10)}`;
}

export function formatIndianPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function displayIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return formatPhone(digits);
  return phone;
}

export function generateEmployeeId(existingIds: string[]): string {
  const numbers = existingIds
    .map((id) => {
      const match = id.match(/DRV-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .filter((n) => !Number.isNaN(n));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
  return `DRV-${next}`;
}

export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

export function createDocumentMeta(file: File): {
  name: string;
  size: number;
  previewUrl?: string;
  uploadedAt: string;
} {
  return {
    name: file.name,
    size: file.size,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
    uploadedAt: new Date().toISOString(),
  };
}

export function createFleetTimelineEvent(
  label: string,
  description?: string,
  type: "info" | "success" | "warning" = "info",
) {
  return {
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    description,
    timestamp: new Date().toISOString(),
    type,
  };
}
