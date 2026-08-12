import type { OfferFormSchema } from "@/features/cms/schema/offer-form.schema";
import type {
  Offer,
  OfferListFilters,
  OfferProduct,
  OfferStats,
  OfferStatus,
  OfferType,
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
  offerType: string;
  badge?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status: string;
  isVisible: boolean;
  products?: Array<{
    product: {
      id: string;
      name: string;
      sku?: string | null;
      brand?: string | null;
      retailPrice?: number | string;
      category?: { name?: string } | null;
      images?: Array<{ url: string }>;
    };
  }>;
}

function mapStatus(row: AdminOffer): OfferStatus {
  if (row.status === "ACTIVE" && row.isVisible) return "ACTIVE";
  if (row.status === "DRAFT") return "DRAFT";
  if (row.endsAt && new Date(row.endsAt).getTime() < Date.now())
    return "EXPIRED";
  if (row.startsAt && new Date(row.startsAt).getTime() > Date.now())
    return "SCHEDULED";
  return "DRAFT";
}

function mapOfferType(row: AdminOffer): OfferType {
  return row.isFeatured ? "featured" : "home-carousel";
}

function mapOffer(row: AdminOffer): Offer {
  return {
    id: row.id,
    name: row.title,
    slug: row.slug,
    description: row.description || "",
    desktopBanner: row.imageUrl || "",
    mobileBanner: row.imageUrl || "",
    offerType: mapOfferType(row),
    products: (row.products || []).map((p) => ({
      id: p.product.id,
      name: p.product.name,
      sku: p.product.sku || "—",
      brand: p.product.brand || "—",
      category: p.product.category?.name || "—",
      price: Number(p.product.retailPrice || 0),
      priceUnit: "Bag",
      thumbnailUrl: p.product.images?.[0]?.url || "",
    })),
    priority: row.priority ?? row.displayOrder ?? 0,
    status: mapStatus(row),
    startDate: row.startsAt
      ? new Date(row.startsAt).toISOString().slice(0, 10)
      : "",
    endDate: row.endsAt ? new Date(row.endsAt).toISOString().slice(0, 10) : "",
    ctaLabel: "Shop Now",
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
  try {
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
  } catch {
    return [];
  }
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
  return offers.filter(
    (offer) => offer.status === "ACTIVE" && offer.offerType === "home-carousel",
  );
}

export async function getOfferProductsCatalog(): Promise<OfferProduct[]> {
  const page = await catalogService.listProducts({ page: 1, limit: 100 });
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
    {
      title: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.desktopBanner || data.mobileBanner,
      offerType: "BUNDLE",
      isFeatured: data.offerType === "featured",
      priority: data.priority,
      displayOrder: data.priority,
      startsAt: data.startDate
        ? new Date(data.startDate).toISOString()
        : undefined,
      endsAt: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      badge: data.ctaLabel,
    },
  );
  const created = res.data;
  if (data.productIds?.length) {
    await api.patch(
      `${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(created.id)}/products`,
      { productIds: data.productIds },
    );
  }
  if (data.status === "ACTIVE") {
    await api.patch(
      `${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(created.id)}/activate`,
    );
  }
  return (await getOfferById(created.id))!;
}

export async function updateOffer(
  id: string,
  data: OfferFormSchema,
): Promise<Offer | null> {
  await api.patch(API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id), {
    title: data.name,
    description: data.description,
    imageUrl: data.desktopBanner || data.mobileBanner,
    isFeatured: data.offerType === "featured",
    priority: data.priority,
    displayOrder: data.priority,
    startsAt: data.startDate
      ? new Date(data.startDate).toISOString()
      : undefined,
    endsAt: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    badge: data.ctaLabel,
  });
  if (data.productIds) {
    await api.patch(`${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id)}/products`, {
      productIds: data.productIds,
    });
  }
  if (data.status === "ACTIVE") {
    await api.patch(`${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id)}/activate`);
  } else {
    await api.patch(`${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id)}/deactivate`);
  }
  return getOfferById(id);
}

export async function deleteOffer(id: string): Promise<boolean> {
  await api.delete(API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id));
  return true;
}

export async function publishOffer(id: string): Promise<Offer | null> {
  await api.patch(`${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id)}/activate`);
  return getOfferById(id);
}

export async function unpublishOffer(id: string): Promise<Offer | null> {
  await api.patch(`${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(id)}/deactivate`);
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
      offerType: "BUNDLE",
      isFeatured: existing.offerType === "featured",
      priority: existing.priority,
      displayOrder: existing.priority,
      startsAt: existing.startDate
        ? new Date(existing.startDate).toISOString()
        : undefined,
      endsAt: existing.endDate
        ? new Date(existing.endDate).toISOString()
        : undefined,
      badge: existing.ctaLabel,
    },
  );

  const created = res.data;
  const productIds = existing.products.map((p) => p.id);
  if (productIds.length) {
    await api.patch(
      `${API_ENDPOINTS.ADMIN_CMS.OFFER_BY_ID(created.id)}/products`,
      { productIds },
    );
  }

  return getOfferById(created.id);
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
