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
} from "@/features/loyalty/types";

/** @deprecated Empty — production UI must not fall back to mock customers. */
export const MOCK_LOYALTY_CUSTOMERS: never[] = [];
