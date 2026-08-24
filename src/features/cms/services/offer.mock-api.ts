import type { OfferFormSchema } from "@/features/cms/schema/offer-form.schema";
import type {
  Offer,
  OfferCtaAction,
  OfferCtaLabel,
  OfferListFilters,
  OfferProduct,
  OfferStats,
  OfferStatus,
  OfferType,
  OfferBadge,
  OfferTargetAudience,
} from "@/features/cms/types/offer.types";
import { catalogService } from "@/services/catalog.service";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

interface AdminOffer {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  offerType: string;
  badge?: string | null;
  ctaLabel?: string | null;
  ctaAction?: string | null;
  targetAudience?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status: string;
  isVisible: boolean;
  lifecycleStatus?: string;
  updatedAt?: string;
  duplicateWarning?: boolean;
  bundlePrice?: number | string | null;
  products?: Array<{
    product: {
      id: string;
      name: string;
      slug?: string | null;
      sku?: string | null;
      brand?: string | null;
      retailPrice?: number | string;
      unit?: string | null;
      category?: { name?: string } | null;
      images?: Array<{ url: string }>;
    };
  }>;
}

const CTA_LABELS: OfferCtaLabel[] = [
  "Shop Now",
  "Buy Now",
  "Explore Offer",
  "View Products",
  "View Details",
];

const BADGES: OfferBadge[] = [
  "HOT DEAL",
  "LIMITED TIME",
  "BULK OFFER",
  "BEST VALUE",
];

function mapCtaLabel(row: AdminOffer): OfferCtaLabel {
  const raw = row.ctaLabel || "";
  if (CTA_LABELS.includes(raw as OfferCtaLabel)) return raw as OfferCtaLabel;
  if (raw === "Explore") return "Explore Offer";
  if (raw === "View Offer") return "View Details";
  return "Shop Now";
}

function mapCtaAction(row: AdminOffer): OfferCtaAction {
  const raw = (row.ctaAction || "").toUpperCase();
  if (
    raw === "OFFER_DETAILS" ||
    raw === "PRODUCTS" ||
    raw === "BUY_NOW" ||
    raw === "VIEW_DETAILS"
  ) {
    return raw;
  }
  const label = mapCtaLabel(row);
  if (label === "Buy Now") return "BUY_NOW";
  if (label === "View Products") return "PRODUCTS";
  if (label === "View Details") return "VIEW_DETAILS";
  return "OFFER_DETAILS";
}

function mapBadge(row: AdminOffer): OfferBadge | "" {
  const raw = (row.badge || "").toUpperCase();
  return BADGES.includes(raw as OfferBadge) ? (raw as OfferBadge) : "";
}

function mapStatus(row: AdminOffer): OfferStatus {
  if (row.lifecycleStatus) {
    return row.lifecycleStatus as OfferStatus;
  }
  if (row.status === "INACTIVE") return "INACTIVE";
  if (row.status === "DRAFT" || !row.isVisible) return "DRAFT";
  if (row.endsAt && new Date(row.endsAt).getTime() < Date.now()) return "EXPIRED";
  if (row.startsAt && new Date(row.startsAt).getTime() > Date.now()) {
    return "SCHEDULED";
  }
  if (row.status === "ACTIVE" && row.isVisible) return "ACTIVE";
  return "DRAFT";
}

function mapOfferType(row: AdminOffer): OfferType {
  return row.isFeatured ? "featured" : "home-carousel";
}

function toIstDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function mapOffer(row: AdminOffer): Offer {
  const desktop = row.imageUrl || row.mobileImageUrl || "";
  const mobile = row.mobileImageUrl || row.imageUrl || "";
  const bundle = Number(row.bundlePrice);
  return {
    id: row.id,
    name: row.title,
    slug: row.slug,
    description: row.description || "",
    desktopBanner: desktop,
    mobileBanner: mobile,
    offerType: mapOfferType(row),
    products: (row.products || []).map((p) => ({
      id: p.product.id,
      slug: p.product.slug || undefined,
      name: p.product.name,
      sku: p.product.sku || "—",
      brand: p.product.brand || "—",
      category: p.product.category?.name || "—",
      price: Number(p.product.retailPrice || 0),
      priceUnit: p.product.unit || "Bag",
      thumbnailUrl: p.product.images?.[0]?.url || "",
    })),
    priority: row.priority ?? row.displayOrder ?? 0,
    status: mapStatus(row),
    startDate: toIstDateInput(row.startsAt),
    endDate: toIstDateInput(row.endsAt),
    ctaLabel: mapCtaLabel(row),
    ctaAction: mapCtaAction(row),
    badge: mapBadge(row),
    targetAudience: (row.targetAudience as OfferTargetAudience) || "ALL",
    startingFrom: Number.isFinite(bundle) && bundle > 0 ? bundle : null,
    updatedAt: row.updatedAt,
    duplicateWarning: row.duplicateWarning,
  };
}

function toPayload(data: OfferFormSchema) {
  return {
    title: data.name,
    description: data.description,
    imageUrl: data.desktopBanner || data.mobileBanner,
    mobileImageUrl: data.mobileBanner || data.desktopBanner,
    offerType: "BUNDLE",
    isFeatured: data.offerType === "featured",
    priority: data.priority,
    displayOrder: data.priority,
    startsAt: data.startDate || undefined,
    endsAt: data.endDate || undefined,
    badge: data.badge || undefined,
    bundlePrice:
      typeof data.startingFrom === "number" && data.startingFrom > 0
        ? data.startingFrom
        : null,
    ctaLabel: data.ctaLabel,
    ctaAction:
      data.ctaLabel === "Buy Now"
        ? "BUY_NOW"
        : data.ctaLabel === "View Products"
          ? "PRODUCTS"
          : data.ctaLabel === "View Details"
            ? "VIEW_DETAILS"
            : "OFFER_DETAILS",
    targetAudience: data.targetAudience ?? "ALL",
  };
}

export function computeOfferStats(offers: Offer[]): OfferStats {
  return {
    total: offers.length,
    active: offers.filter((o) => o.status === "ACTIVE").length,
    scheduled: offers.filter((o) => o.status === "SCHEDULED").length,
    expired: offers.filter((o) => o.status === "EXPIRED").length,
  };
}

export async function getOffers(): Promise<Offer[]> {
  const { data } = await api.get<
    ApiResponse<{ data: AdminOffer[]; meta: unknown } | AdminOffer[]>
  >(API_ENDPOINTS.ADMIN_CMS.OFFERS, { params: { page: 1, limit: 100 } });

  const payload = data.data;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return rows.map(mapOffer);
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const { data } = await api.get<ApiResponse<AdminOffer>>(
    API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id),
  );
  return data.data ? mapOffer(data.data) : null;
}

export async function getOfferStats(): Promise<OfferStats> {
  const offers = await getOffers();
  return computeOfferStats(offers);
}

export async function getPublishedCarouselOffers(): Promise<Offer[]> {
  const offers = await getOffers();
  return offers.filter((offer) => offer.status === "ACTIVE");
}

export async function getOfferProductsCatalog(
  search?: string,
): Promise<OfferProduct[]> {
  const page = await catalogService.listProducts({
    page: 1,
    limit: 200,
    search: search || undefined,
  });
  return page.data.map((p) => ({
    id: p.id,
    slug: p.slug || undefined,
    name: p.name,
    sku: p.sku || "—",
    brand: p.brand || "—",
    category: p.category?.name || "—",
    price: Number(p.retailPrice || 0),
    priceUnit: p.unit || "Bag",
    thumbnailUrl: p.images?.[0]?.url || "",
  }));
}

export async function createOffer(data: OfferFormSchema): Promise<Offer> {
  const { data: res } = await api.post<ApiResponse<AdminOffer>>(
    API_ENDPOINTS.ADMIN_CMS.OFFERS,
    toPayload(data),
  );
  const created = res.data;
  if (data.productIds?.length) {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PRODUCTS(created.id), {
      productIds: data.productIds,
    });
  }
  if (data.status === "ACTIVE" || data.status === "SCHEDULED") {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PUBLISH(created.id));
  }
  return (await getOfferById(created.id))!;
}

export async function updateOffer(
  id: string,
  data: OfferFormSchema,
): Promise<Offer | null> {
  await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id), toPayload(data));
  if (data.productIds) {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PRODUCTS(id), {
      productIds: data.productIds,
    });
  }
  if (data.status === "ACTIVE" || data.status === "SCHEDULED") {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PUBLISH(id));
  } else if (data.status === "DRAFT" || data.status === "INACTIVE") {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_DEACTIVATE(id));
  }
  return getOfferById(id);
}

export async function deleteOffer(id: string): Promise<boolean> {
  await api.delete(API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id));
  return true;
}

export async function publishOffer(id: string): Promise<Offer | null> {
  await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PUBLISH(id));
  return getOfferById(id);
}

export async function unpublishOffer(id: string): Promise<Offer | null> {
  await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_DEACTIVATE(id));
  return getOfferById(id);
}

export async function duplicateOffer(id: string): Promise<Offer | null> {
  const existing = await getOfferById(id);
  if (!existing) return null;

  const slug = `${existing.slug}-copy-${Date.now()}`.slice(0, 100);
  const { data: res } = await api.post<ApiResponse<AdminOffer>>(
    API_ENDPOINTS.ADMIN_CMS.OFFERS,
    {
      title: `${existing.name} (Copy)`,
      slug,
      description: existing.description,
      imageUrl: existing.desktopBanner || existing.mobileBanner,
      mobileImageUrl: existing.mobileBanner || existing.desktopBanner,
      offerType: "BUNDLE",
      isFeatured: existing.offerType === "featured",
      priority: existing.priority,
      displayOrder: existing.priority,
      startsAt: existing.startDate || undefined,
      endsAt: existing.endDate || undefined,
      badge: existing.badge || undefined,
      ctaLabel: existing.ctaLabel,
      ctaAction: existing.ctaAction,
      targetAudience: existing.targetAudience,
      bundlePrice: existing.startingFrom ?? null,
    },
  );

  const created = res.data;
  const productIds = existing.products.map((p) => p.id);
  if (productIds.length) {
    await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_PRODUCTS(created.id), {
      productIds,
    });
  }

  return getOfferById(created.id);
}

export function findDuplicateOffers(
  offers: Offer[],
  candidate: Pick<Offer, "name" | "offerType" | "startDate" | "endDate">,
  excludeId?: string,
): Offer[] {
  const name = candidate.name.trim().toLowerCase();
  if (!name) return [];
  return offers.filter((offer) => {
    if (excludeId && offer.id === excludeId) return false;
    if (offer.name.trim().toLowerCase() !== name) return false;
    if (offer.offerType !== candidate.offerType) return false;
    if (!offer.startDate || !offer.endDate) return false;
    if (!candidate.startDate || !candidate.endDate) return false;
    return (
      offer.startDate <= candidate.endDate &&
      candidate.startDate <= offer.endDate
    );
  });
}

export function queryOffers(
  offers: Offer[],
  filters: OfferListFilters,
): { rows: Offer[]; total: number } {
  const search = filters.search.trim().toLowerCase();
  let rows = (offers ?? []).filter((offer) => {
    const matchesSearch =
      !search ||
      offer.name.toLowerCase().includes(search) ||
      offer.slug.toLowerCase().includes(search);
    const matchesStatus =
      filters.status === "all" || offer.status === filters.status;
    const matchesType =
      filters.offerType === "all" || offer.offerType === filters.offerType;
    return matchesSearch && matchesStatus && matchesType;
  });

  rows = [...rows].sort((a, b) =>
    filters.sortByPriority === "asc"
      ? a.priority - b.priority
      : b.priority - a.priority,
  );

  const total = rows.length;
  const start = (filters.page - 1) * filters.pageSize;
  return {
    rows: rows.slice(start, start + filters.pageSize),
    total,
  };
}
