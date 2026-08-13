export type OfferStatus =
  | "ACTIVE"
  | "SCHEDULED"
  | "EXPIRED"
  | "DRAFT"
  | "INACTIVE";

/** MVP placement — where the offer appears in the customer app. */
export type OfferType = "home-carousel" | "featured";

export type OfferCtaLabel =
  | "Shop Now"
  | "Buy Now"
  | "Explore Offer"
  | "View Products"
  | "View Details";

export type OfferCtaAction =
  | "OFFER_DETAILS"
  | "PRODUCTS"
  | "BUY_NOW"
  | "VIEW_DETAILS";

export type OfferBadge =
  | "HOT DEAL"
  | "LIMITED TIME"
  | "BULK OFFER"
  | "BEST VALUE";

export type OfferTargetAudience =
  | "ALL"
  | "NEW_CUSTOMERS"
  | "EXISTING_CUSTOMERS"
  | "CONTRACTORS"
  | "MASONS"
  | "INTERIOR_DESIGNERS"
  | "ARCHITECTS"
  | "BUILDERS"
  | "DEVELOPERS"
  | "MEMBERSHIP_TIER"
  | "CUSTOM_SEGMENT";

export interface OfferProduct {
  id: string;
  slug?: string;
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
  ctaAction: OfferCtaAction;
  badge: OfferBadge | "";
  targetAudience: OfferTargetAudience;
  startingFrom?: number | null;
  updatedAt?: string;
  duplicateWarning?: boolean;
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
