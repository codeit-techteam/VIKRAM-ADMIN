import type {
  Offer,
  OfferCtaLabel,
  OfferProduct,
  OfferStats,
  OfferStatus,
  OfferType,
} from "@/features/cms/types/offer.types";

export const OFFER_PRODUCT_CATALOG: OfferProduct[] = [
  {
    id: "prod-001",
    name: "UltraTech PPC Cement",
    sku: "UT-C-001",
    brand: "UltraTech",
    category: "Cement",
    price: 450,
    priceUnit: "bag",
    thumbnailUrl: "https://picsum.photos/seed/ultratech-cement/80/80",
  },
  {
    id: "prod-002",
    name: "TATA Tiscon TMT Bar",
    sku: "TT-S-442",
    brand: "TATA Tiscon",
    category: "Steel",
    price: 68500,
    priceUnit: "ton",
    thumbnailUrl: "https://picsum.photos/seed/tata-tiscon/80/80",
  },
  {
    id: "prod-003",
    name: "Ambuja Kawach",
    sku: "AC-889",
    brand: "Ambuja",
    category: "Cement",
    price: 480,
    priceUnit: "bag",
    thumbnailUrl: "https://picsum.photos/seed/ambuja-kawach/80/80",
  },
  {
    id: "prod-004",
    name: "Premium Fine Sand",
    sku: "SD-A-101",
    brand: "Bajriwala Local",
    category: "Aggregates",
    price: 3200,
    priceUnit: "unit",
    thumbnailUrl: "https://picsum.photos/seed/premium-sand/80/80",
  },
  {
    id: "prod-005",
    name: "ACC Gold Cement",
    sku: "ACC-G-220",
    brand: "ACC",
    category: "Cement",
    price: 465,
    priceUnit: "bag",
    thumbnailUrl: "https://picsum.photos/seed/acc-gold/80/80",
  },
  {
    id: "prod-006",
    name: "JSW NeoSteel",
    sku: "JSW-NS-12",
    brand: "JSW",
    category: "Steel",
    price: 67200,
    priceUnit: "ton",
    thumbnailUrl: "https://picsum.photos/seed/jsw-neosteel/80/80",
  },
  {
    id: "prod-007",
    name: "Crushed Stone Aggregate",
    sku: "AGG-CS-40",
    brand: "Bajriwala Local",
    category: "Aggregates",
    price: 1850,
    priceUnit: "unit",
    thumbnailUrl: "https://picsum.photos/seed/crushed-stone/80/80",
  },
  {
    id: "prod-008",
    name: "Birla A1+ Cement",
    sku: "BA1-C-090",
    brand: "Birla",
    category: "Cement",
    price: 440,
    priceUnit: "bag",
    thumbnailUrl: "https://picsum.photos/seed/birla-a1/80/80",
  },
];

function productsByIds(ids: string[]): OfferProduct[] {
  return ids
    .map((id) => OFFER_PRODUCT_CATALOG.find((product) => product.id === id))
    .filter((product): product is OfferProduct => Boolean(product));
}

export const INITIAL_OFFERS: Offer[] = [
  {
    id: "offer-001",
    name: "Monsoon Cement Mega Sale",
    slug: "monsoon-cement-mega-sale",
    description:
      "Stock up on premium cement brands before the monsoon construction rush. Limited-time contractor pricing.",
    desktopBanner: "https://picsum.photos/seed/offer-cement-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-cement-mob/800/600",
    offerType: "home-carousel",
    products: productsByIds(["prod-001", "prod-003", "prod-005", "prod-008"]),
    priority: 9,
    status: "ACTIVE",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    ctaLabel: "Shop Now",
  },
  {
    id: "offer-002",
    name: "TATA Steel Bulk Bundle",
    slug: "tata-steel-bulk-bundle",
    description:
      "Exclusive brand offer on TATA Tiscon TMT bars for bulk procurement orders above 5 tons.",
    desktopBanner: "https://picsum.photos/seed/offer-tata-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-tata-mob/800/600",
    offerType: "home-carousel",
    products: productsByIds(["prod-002"]),
    priority: 8,
    status: "ACTIVE",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    ctaLabel: "Buy Now",
  },
  {
    id: "offer-003",
    name: "Foundation Combo Pack",
    slug: "foundation-combo-pack",
    description:
      "Cement + sand + aggregate combo priced for foundation pours. Ideal for residential projects.",
    desktopBanner: "https://picsum.photos/seed/offer-combo-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-combo-mob/800/600",
    offerType: "featured",
    products: productsByIds(["prod-001", "prod-004", "prod-007"]),
    priority: 7,
    status: "SCHEDULED",
    startDate: "2026-08-01",
    endDate: "2026-09-15",
    ctaLabel: "View Offer",
  },
  {
    id: "offer-004",
    name: "JSW NeoSteel Flash Deal",
    slug: "jsw-neosteel-flash-deal",
    description:
      "Flash deal on JSW NeoSteel for verified B2B accounts. Valid while stock lasts.",
    desktopBanner: "https://picsum.photos/seed/offer-jsw-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-jsw-mob/800/600",
    offerType: "home-carousel",
    products: productsByIds(["prod-006"]),
    priority: 10,
    status: "SCHEDULED",
    startDate: "2026-07-20",
    endDate: "2026-07-25",
    ctaLabel: "Explore",
  },
  {
    id: "offer-005",
    name: "Winter Aggregates Clearance",
    slug: "winter-aggregates-clearance",
    description:
      "Clearance pricing on fine sand and crushed stone for off-season stocking.",
    desktopBanner: "https://picsum.photos/seed/offer-agg-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-agg-mob/800/600",
    offerType: "featured",
    products: productsByIds(["prod-004", "prod-007"]),
    priority: 4,
    status: "EXPIRED",
    startDate: "2025-12-01",
    endDate: "2026-02-28",
    ctaLabel: "Shop Now",
  },
  {
    id: "offer-006",
    name: "Ambuja Kawach Promo",
    slug: "ambuja-kawach-promo",
    description:
      "Draft promo for Ambuja Kawach waterproof cement. Pending brand creative approval.",
    desktopBanner: "https://picsum.photos/seed/offer-ambuja-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-ambuja-mob/800/600",
    offerType: "home-carousel",
    products: productsByIds(["prod-003"]),
    priority: 5,
    status: "DRAFT",
    startDate: "2026-08-10",
    endDate: "2026-09-10",
    ctaLabel: "Buy Now",
  },
  {
    id: "offer-007",
    name: "Site Essentials Duo",
    slug: "site-essentials-duo",
    description:
      "UltraTech cement paired with TATA Tiscon for complete site essentials procurement.",
    desktopBanner: "https://picsum.photos/seed/offer-duo-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-duo-mob/800/600",
    offerType: "featured",
    products: productsByIds(["prod-001", "prod-002"]),
    priority: 6,
    status: "ACTIVE",
    startDate: "2026-06-15",
    endDate: "2026-09-30",
    ctaLabel: "Shop Now",
  },
  {
    id: "offer-008",
    name: "ACC Gold Contractor Rate",
    slug: "acc-gold-contractor-rate",
    description:
      "Special contractor rates on ACC Gold Cement for registered Bajriwala partners.",
    desktopBanner: "https://picsum.photos/seed/offer-acc-desk/1200/400",
    mobileBanner: "https://picsum.photos/seed/offer-acc-mob/800/600",
    offerType: "featured",
    products: productsByIds(["prod-005"]),
    priority: 3,
    status: "EXPIRED",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    ctaLabel: "View Offer",
  },
];

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  "home-carousel": "Home Carousel",
  featured: "Featured",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  ACTIVE: "Active",
  SCHEDULED: "Scheduled",
  EXPIRED: "Expired",
  DRAFT: "Draft",
};

export const OFFER_CTA_OPTIONS: OfferCtaLabel[] = [
  "Shop Now",
  "Buy Now",
  "Explore",
  "View Offer",
];

export const OFFER_TYPE_OPTIONS: { value: OfferType; label: string }[] = [
  { value: "home-carousel", label: "Home Carousel" },
  { value: "featured", label: "Featured" },
];

export const OFFER_STATUS_OPTIONS: {
  value: OfferStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "EXPIRED", label: "Expired" },
  { value: "DRAFT", label: "Draft" },
];

export function computeOfferStats(offers: Offer[]): OfferStats {
  return {
    total: offers.length,
    active: offers.filter((offer) => offer.status === "ACTIVE").length,
    scheduled: offers.filter((offer) => offer.status === "SCHEDULED").length,
    expired: offers.filter((offer) => offer.status === "EXPIRED").length,
  };
}

export function slugifyOfferName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatOfferDate(date: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatOfferPrice(price: number, unit: string): string {
  return `₹${price.toLocaleString("en-IN")}/${unit}`;
}
