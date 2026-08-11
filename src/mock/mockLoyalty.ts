/**
 * @deprecated Import types from `@/features/loyalty/types` instead.
 * Mock loyalty seed arrays were removed — Admin loyalty is API-driven.
 */
export type {
  CustomerLoyalty,
  LoyaltyDashboardStats,
  LoyaltyOrderEarned,
  LoyaltyPointHistory,
  LoyaltyRedemption,
  LoyaltyTier,
} from "@/features/loyalty/types";

/** @deprecated Thresholds live in backend loyalty.constants — do not use for UI math. */
export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 2000,
  PLATINUM: 5000,
} as const;

/** @deprecated Empty — production UI must not fall back to mock customers. */
export const MOCK_LOYALTY_CUSTOMERS: never[] = [];
