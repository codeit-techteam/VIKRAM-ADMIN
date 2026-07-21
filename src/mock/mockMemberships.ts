export type MembershipStatus =
  "ACTIVE" | "EXPIRED" | "EXPIRING_SOON" | "CANCELLED";
export type MembershipPaymentStatus = "PAID" | "PENDING" | "REFUNDED";
export type MembershipPlanType = "SILVER" | "GOLD" | "PLATINUM";

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
  membership: MembershipPlanType;
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

export const MEMBERSHIP_BENEFITS: Record<
  MembershipPlanType,
  MembershipBenefit[]
> = {
  SILVER: [
    { id: "b1", label: "5% discount on bulk orders", enabled: true },
    { id: "b2", label: "Priority customer support", enabled: true },
    {
      id: "b3",
      label: "Free delivery on orders above ₹10,000",
      enabled: false,
    },
  ],
  GOLD: [
    { id: "b1", label: "10% discount on bulk orders", enabled: true },
    { id: "b2", label: "Priority customer support", enabled: true },
    { id: "b3", label: "Free delivery on orders above ₹5,000", enabled: true },
    { id: "b4", label: "Dedicated account manager", enabled: true },
  ],
  PLATINUM: [
    { id: "b1", label: "15% discount on bulk orders", enabled: true },
    { id: "b2", label: "24/7 priority support", enabled: true },
    { id: "b3", label: "Free delivery on all orders", enabled: true },
    { id: "b4", label: "Dedicated account manager", enabled: true },
    { id: "b5", label: "Early access to new products", enabled: true },
  ],
};

export const MOCK_MEMBERSHIPS: CustomerMembership[] = [
  {
    id: "mem-001",
    customerId: "cust-001",
    customerName: "Ravi Teja Constructions",
    customerPhone: "+91 98765 43210",
    customerCity: "Mumbai",
    membership: "GOLD",
    purchaseDate: "2025-11-15",
    expiryDate: "2026-11-15",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 24999,
    benefits: MEMBERSHIP_BENEFITS.GOLD,
    history: [
      {
        id: "mh-001",
        plan: "SILVER",
        purchaseDate: "2024-11-15",
        expiryDate: "2025-11-15",
        amount: 9999,
        status: "EXPIRED",
        paymentStatus: "PAID",
      },
      {
        id: "mh-002",
        plan: "GOLD",
        purchaseDate: "2025-11-15",
        expiryDate: "2026-11-15",
        amount: 24999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-002",
    customerId: "cust-002",
    customerName: "Skyline Infra Pvt Ltd",
    customerPhone: "+91 91234 56789",
    customerCity: "Pune",
    membership: "PLATINUM",
    purchaseDate: "2025-08-01",
    expiryDate: "2026-08-01",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 49999,
    benefits: MEMBERSHIP_BENEFITS.PLATINUM,
    history: [
      {
        id: "mh-003",
        plan: "PLATINUM",
        purchaseDate: "2025-08-01",
        expiryDate: "2026-08-01",
        amount: 49999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-003",
    customerId: "cust-003",
    customerName: "Metro Build Solutions",
    customerPhone: "+91 99887 76655",
    customerCity: "Delhi NCR",
    membership: "SILVER",
    purchaseDate: "2025-01-10",
    expiryDate: "2026-01-10",
    status: "EXPIRING_SOON",
    paymentStatus: "PAID",
    amount: 9999,
    benefits: MEMBERSHIP_BENEFITS.SILVER,
    history: [
      {
        id: "mh-004",
        plan: "SILVER",
        purchaseDate: "2025-01-10",
        expiryDate: "2026-01-10",
        amount: 9999,
        status: "EXPIRING_SOON",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-004",
    customerId: "cust-004",
    customerName: "Greenfield Developers",
    customerPhone: "+91 97654 32109",
    customerCity: "Bangalore",
    membership: "GOLD",
    purchaseDate: "2024-06-20",
    expiryDate: "2025-06-20",
    status: "EXPIRED",
    paymentStatus: "PAID",
    amount: 24999,
    benefits: MEMBERSHIP_BENEFITS.GOLD,
    history: [
      {
        id: "mh-005",
        plan: "GOLD",
        purchaseDate: "2024-06-20",
        expiryDate: "2025-06-20",
        amount: 24999,
        status: "EXPIRED",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-005",
    customerId: "cust-005",
    customerName: "Apex Realty Group",
    customerPhone: "+91 96543 21098",
    customerCity: "Hyderabad",
    membership: "SILVER",
    purchaseDate: "2025-12-01",
    expiryDate: "2026-12-01",
    status: "ACTIVE",
    paymentStatus: "PENDING",
    amount: 9999,
    benefits: MEMBERSHIP_BENEFITS.SILVER,
    history: [
      {
        id: "mh-006",
        plan: "SILVER",
        purchaseDate: "2025-12-01",
        expiryDate: "2026-12-01",
        amount: 9999,
        status: "ACTIVE",
        paymentStatus: "PENDING",
      },
    ],
  },
  {
    id: "mem-006",
    customerId: "cust-006",
    customerName: "Heritage Construction Co",
    customerPhone: "+91 95432 10987",
    customerCity: "Chennai",
    membership: "GOLD",
    purchaseDate: "2025-03-15",
    expiryDate: "2026-03-15",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 24999,
    benefits: MEMBERSHIP_BENEFITS.GOLD,
    history: [
      {
        id: "mh-007",
        plan: "GOLD",
        purchaseDate: "2025-03-15",
        expiryDate: "2026-03-15",
        amount: 24999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-007",
    customerId: "cust-007",
    customerName: "Urban Edge Projects",
    customerPhone: "+91 94321 09876",
    customerCity: "Ahmedabad",
    membership: "PLATINUM",
    purchaseDate: "2025-09-10",
    expiryDate: "2026-09-10",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 49999,
    benefits: MEMBERSHIP_BENEFITS.PLATINUM,
    history: [
      {
        id: "mh-008",
        plan: "PLATINUM",
        purchaseDate: "2025-09-10",
        expiryDate: "2026-09-10",
        amount: 49999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-008",
    customerId: "cust-008",
    customerName: "Prime Contractors LLP",
    customerPhone: "+91 93210 98765",
    customerCity: "Jaipur",
    membership: "SILVER",
    purchaseDate: "2024-12-05",
    expiryDate: "2025-12-05",
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    amount: 9999,
    benefits: MEMBERSHIP_BENEFITS.SILVER,
    history: [
      {
        id: "mh-009",
        plan: "SILVER",
        purchaseDate: "2024-12-05",
        expiryDate: "2025-12-05",
        amount: 9999,
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
    ],
  },
  {
    id: "mem-009",
    customerId: "cust-009",
    customerName: "Nexus Buildtech",
    customerPhone: "+91 92109 87654",
    customerCity: "Kolkata",
    membership: "GOLD",
    purchaseDate: "2025-07-22",
    expiryDate: "2026-07-22",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 24999,
    benefits: MEMBERSHIP_BENEFITS.GOLD,
    history: [
      {
        id: "mh-010",
        plan: "GOLD",
        purchaseDate: "2025-07-22",
        expiryDate: "2026-07-22",
        amount: 24999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-010",
    customerId: "cust-010",
    customerName: "Shree Cement Works",
    customerPhone: "+91 91098 76543",
    customerCity: "Lucknow",
    membership: "SILVER",
    purchaseDate: "2025-02-28",
    expiryDate: "2026-02-28",
    status: "EXPIRING_SOON",
    paymentStatus: "PAID",
    amount: 9999,
    benefits: MEMBERSHIP_BENEFITS.SILVER,
    history: [
      {
        id: "mh-011",
        plan: "SILVER",
        purchaseDate: "2025-02-28",
        expiryDate: "2026-02-28",
        amount: 9999,
        status: "EXPIRING_SOON",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-011",
    customerId: "cust-011",
    customerName: "Coastal Infra Ltd",
    customerPhone: "+91 90987 65432",
    customerCity: "Kochi",
    membership: "PLATINUM",
    purchaseDate: "2025-10-05",
    expiryDate: "2026-10-05",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 49999,
    benefits: MEMBERSHIP_BENEFITS.PLATINUM,
    history: [
      {
        id: "mh-012",
        plan: "PLATINUM",
        purchaseDate: "2025-10-05",
        expiryDate: "2026-10-05",
        amount: 49999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: "mem-012",
    customerId: "cust-012",
    customerName: "Vikram Builders",
    customerPhone: "+91 89876 54321",
    customerCity: "Indore",
    membership: "GOLD",
    purchaseDate: "2025-05-18",
    expiryDate: "2026-05-18",
    status: "ACTIVE",
    paymentStatus: "PAID",
    amount: 24999,
    benefits: MEMBERSHIP_BENEFITS.GOLD,
    history: [
      {
        id: "mh-013",
        plan: "SILVER",
        purchaseDate: "2024-05-18",
        expiryDate: "2025-05-18",
        amount: 9999,
        status: "EXPIRED",
        paymentStatus: "PAID",
      },
      {
        id: "mh-014",
        plan: "GOLD",
        purchaseDate: "2025-05-18",
        expiryDate: "2026-05-18",
        amount: 24999,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    ],
  },
];

export function computeMembershipStats(
  memberships: CustomerMembership[],
): MembershipDashboardStats {
  const active = memberships.filter((m) => m.status === "ACTIVE");
  const expiring = memberships.filter((m) => m.status === "EXPIRING_SOON");
  const revenue = memberships
    .filter((m) => m.paymentStatus === "PAID")
    .reduce((sum, m) => sum + m.amount, 0);

  return {
    totalMembers: memberships.length,
    activeMemberships: active.length,
    expiringThisMonth: expiring.length,
    membershipRevenue: revenue,
  };
}
