export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DRAFT";

/** MVP placement — where the offer appears in the customer app. */
export type OfferType = "home-carousel" | "featured";

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
  sortByPriority: "asc" | "desc";
  page: number;
  pageSize: number;
}
