import type { CeNewCustomerDraft } from "@/features/customer-executive/types";

const DRAFT_KEY = "ce-customer-registration-draft";

export function saveCustomerDraft(draft: Partial<CeNewCustomerDraft>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
  );
}

export function loadCustomerDraft():
  | (Partial<CeNewCustomerDraft> & {
      savedAt?: string;
    })
  | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<CeNewCustomerDraft> & {
      savedAt?: string;
    };
  } catch {
    return null;
  }
}

export function clearCustomerDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
