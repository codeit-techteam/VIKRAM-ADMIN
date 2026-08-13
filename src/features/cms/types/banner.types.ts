export type BannerStatus =
  | "ACTIVE"
  | "SCHEDULED"
  | "DRAFT"
  | "EXPIRED"
  | "INACTIVE";

export type ModificationStatus = "ACTIVE" | "SCHEDULED";

export type BannerTargetAudience =
  | "ALL"
  | "NEW_CUSTOMERS"
  | "FREE_BIKE_REMAINING"
  | "FREE_BIKE_EXHAUSTED";

export interface Banner {
  id: string;
  thumbnailUrl: string;
  name?: string | null;
  description?: string | null;
  title: string;
  subtitle?: string | null;
  location: string;
  ctaLabel: string;
  ctaPath: string;
  linkType?: string | null;
  status: BannerStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  targetAudience?: BannerTargetAudience | null;
  backgroundColor?: string | null;
  badge?: string | null;
  ctaColor?: string | null;
  mobileUrl?: string | null;
  desktopUrl?: string | null;
  imageUrl?: string | null;
  updatedAt?: string | null;
}

export interface BannerModification {
  id: string;
  thumbnailUrl: string;
  name: string;
  hubTargeting: string;
  status: ModificationStatus;
  clicks: number;
  updatedBy: string;
  updatedByAvatar: string;
}

export function computeBannerLifecycleStatus(banner: {
  status: string;
  isVisible?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}): BannerStatus {
  const raw = (banner.status || "").toUpperCase();
  if (raw === "DRAFT") return "DRAFT";
  if (raw === "INACTIVE" || banner.isVisible === false) return "INACTIVE";

  const now = Date.now();
  if (banner.startsAt) {
    const start = new Date(banner.startsAt).getTime();
    if (Number.isFinite(start) && start > now) return "SCHEDULED";
  }
  if (banner.endsAt) {
    const end = new Date(banner.endsAt).getTime();
    if (Number.isFinite(end) && end < now) return "EXPIRED";
  }
  if (raw === "ACTIVE" || raw === "LIVE") return "ACTIVE";
  return "INACTIVE";
}
