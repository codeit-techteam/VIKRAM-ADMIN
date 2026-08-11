export type MembershipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "CANCELLED"
  | "PENDING";

export type MembershipPaymentStatus =
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

export type MembershipPlanType = "SILVER" | "GOLD" | "PLATINUM" | string;

export interface MembershipBenefit {
  id: string;
  label: string;
  enabled: boolean;
}

export interface MembershipHistoryEntry {
  id: string;
  plan: MembershipPlanType;
  purchaseDate: string;
  expiryDate: string;
  amount: number;
  status: MembershipStatus;
  paymentStatus: MembershipPaymentStatus;
}

export interface CustomerMembership {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerCompany?: string;
  membership: MembershipPlanType;
  planName?: string;
  purchaseDate: string;
  expiryDate: string;
  status: MembershipStatus;
  paymentStatus: MembershipPaymentStatus;
  amount: number;
  benefits: MembershipBenefit[];
  history: MembershipHistoryEntry[];
}

export interface MembershipDashboardStats {
  totalMembers: number;
  activeMemberships: number;
  expiringThisMonth: number;
  membershipRevenue: number;
}
