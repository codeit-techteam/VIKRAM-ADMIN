import { notify } from "@/utils/notify";

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function initiateCall(phone: string, label?: string): void {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 10) {
    notify.error(
      "Invalid phone number",
      "Enter a valid 10-digit mobile number",
    );
    return;
  }
  window.open(`tel:+${normalizeIndianPhone(phone)}`, "_self");
  notify.success("Calling", label ?? phone);
}

export function openWhatsApp(
  phone: string,
  message?: string,
  contactName?: string,
): void {
  const normalized = normalizeIndianPhone(phone);
  if (normalized.length < 12) {
    notify.error(
      "Invalid phone number",
      "Enter a valid 10-digit mobile number",
    );
    return;
  }
  const text = message
    ? encodeURIComponent(message)
    : encodeURIComponent(
        `Hello${contactName ? ` ${contactName}` : ""}, this is BuildQuick India support.`,
      );
  window.open(`https://wa.me/${normalized}?text=${text}`, "_blank", "noopener");
  notify.success("WhatsApp opened", contactName ?? phone);
}
