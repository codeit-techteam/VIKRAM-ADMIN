/**
 * @deprecated Import types from `@/features/membership/types` instead.
 * Mock membership seed arrays were removed — Admin membership is API-driven.
 */
export type {
  CustomerMembership,
  MembershipBenefit,
  MembershipDashboardStats,
  MembershipHistoryEntry,
  MembershipPaymentStatus,
  MembershipPlanType,
  MembershipStatus,
} from "@/features/membership/types";

/** @deprecated Empty — production UI must not fall back to mock memberships. */
export const MOCK_MEMBERSHIPS: never[] = [];

export function computeMembershipStats(): {
  totalMembers: number;
  activeMemberships: number;
  expiringThisMonth: number;
  membershipRevenue: number;
} {
  return {
    totalMembers: 0,
    activeMemberships: 0,
    expiringThisMonth: 0,
    membershipRevenue: 0,
  };
}
