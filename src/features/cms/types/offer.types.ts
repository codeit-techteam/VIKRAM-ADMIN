export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DRAFT";

export type OfferType = "product" | "brand" | "category" | "combo";

export type OfferVisibility = "home-carousel" | "featured" | "both";

export type OfferCtaLabel = "Shop Now" | "Buy Now" | "Explore" | "View Offer";

export interface OfferProduct {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  priceUnit: string;
  thumbnailUrl: string;
}

export interface Offer {
  id: string;
  name: string;
  slug: string;
  description: string;
  desktopBanner: string;
  mobileBanner: string;
  offerType: OfferType;
  products: OfferProduct[];
  priority: number;
  visibility: OfferVisibility;
  status: OfferStatus;
  startDate: string;
  endDate: string;
  ctaLabel: OfferCtaLabel;
}

export interface OfferStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
}

export interface OfferListFilters {
  search: string;
  status: OfferStatus | "all";
  offerType: OfferType | "all";
  visibility: OfferVisibility | "all";
  sortByPriority: "asc" | "desc";
  page: number;
  pageSize: number;
}
