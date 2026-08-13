export type DeliveryPromotionStatus =
  | "ACTIVE"
  | "SCHEDULED"
  | "DRAFT"
  | "EXPIRED"
  | "INACTIVE";

export type DeliveryPromotionAudience =
  | "ALL"
  | "NEW_CUSTOMERS"
  | "FREE_BIKE_REMAINING"
  | "FREE_BIKE_EXHAUSTED";

export type DeliveryPromotionPlacement = "HOME_TOP_DELIVERY_PROMOTION";

export interface DeliveryPromotion {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  headline: string;
  subtitle?: string | null;
  badge?: string | null;
  remainingHeadline?: string | null;
  exhaustedHeadline?: string | null;
  exhaustedBehavior?: "HIDE" | "SHOW_ALTERNATE" | null;
  bannerImage: string;
  mobileBannerImage?: string | null;
  desktopBannerImage?: string | null;
  placement: DeliveryPromotionPlacement | string;
  targetAudience: DeliveryPromotionAudience;
  status: DeliveryPromotionStatus;
  lifecycleStatus?: DeliveryPromotionStatus;
  isVisible?: boolean;
  priority: number;
  ctaEnabled: boolean;
  ctaLabel?: string | null;
  ctaType?: string | null;
  ctaValue?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface DeliveryPromotionStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
}

export function computeDeliveryPromotionLifecycle(promo: {
  status?: string | null;
  lifecycleStatus?: string | null;
  isVisible?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}): DeliveryPromotionStatus {
  if (promo.lifecycleStatus) {
    const life = promo.lifecycleStatus.toUpperCase();
    if (
      life === "ACTIVE" ||
      life === "SCHEDULED" ||
      life === "DRAFT" ||
      life === "EXPIRED" ||
      life === "INACTIVE"
    ) {
      return life;
    }
  }

  const raw = (promo.status || "").toUpperCase();
  if (raw === "DRAFT") return "DRAFT";
  if (raw === "INACTIVE" || promo.isVisible === false) return "INACTIVE";

  const now = Date.now();
  if (promo.startsAt) {
    const start = new Date(promo.startsAt).getTime();
    if (Number.isFinite(start) && start > now) return "SCHEDULED";
  }
  if (promo.endsAt) {
    const end = new Date(promo.endsAt).getTime();
    if (Number.isFinite(end) && end < now) return "EXPIRED";
  }
  if (raw === "ACTIVE") return "ACTIVE";
  return "INACTIVE";
}

export function computeDeliveryPromotionStats(
  rows: DeliveryPromotion[],
): DeliveryPromotionStats {
  return rows.reduce(
    (acc, row) => {
      acc.total += 1;
      const status = computeDeliveryPromotionLifecycle(row);
      if (status === "ACTIVE") acc.active += 1;
      if (status === "SCHEDULED") acc.scheduled += 1;
      if (status === "EXPIRED") acc.expired += 1;
      return acc;
    },
    { total: 0, active: 0, scheduled: 0, expired: 0 },
  );
}
