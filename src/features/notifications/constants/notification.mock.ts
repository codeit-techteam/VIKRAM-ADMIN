/** Select-option constants only — history/stats come from the live API. */

export const AUDIENCE_CITY_HUB_OPTIONS = [
  { value: "ahmedabad", label: "Ahmedabad Hub" },
  { value: "surat", label: "Surat Hub" },
  { value: "vadodara", label: "Vadodara Hub" },
  { value: "rajkot", label: "Rajkot Hub" },
  { value: "pan-gujarat", label: "Pan-Gujarat" },
] as const;

export const AUDIENCE_SEGMENT_OPTIONS = [
  { value: "new", label: "New Users" },
  { value: "active", label: "Active Users" },
  { value: "dormant", label: "Dormant Users" },
] as const;

export const DEEP_LINK_OPTIONS = [
  { value: "home", label: "Home Screen" },
  { value: "product", label: "Specific Product" },
  { value: "offer", label: "Specific Offer" },
  { value: "category", label: "Category Page" },
  { value: "custom_url", label: "Custom URL" },
] as const;

export const DEEP_LINK_PRODUCT_OPTIONS = [
  { value: "acc-cement-50kg", label: "ACC Cement 50kg" },
  { value: "tata-tmt-12mm", label: "TATA TMT 12mm" },
  { value: "jcb-3dx", label: "JCB 3DX Excavator" },
] as const;

export const DEEP_LINK_OFFER_OPTIONS = [
  { value: "monsoon-sale", label: "Monsoon Sale 2026" },
  { value: "weekend-cement", label: "Weekend Cement Offer" },
] as const;

export const DEEP_LINK_CATEGORY_OPTIONS = [
  { value: "cement", label: "Cement" },
  { value: "steel", label: "Steel & TMT" },
  { value: "machinery", label: "Machinery" },
] as const;
