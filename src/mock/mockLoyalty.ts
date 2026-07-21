export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface LoyaltyPointHistory {
  id: string;
  type: "EARNED" | "REDEEMED" | "EXPIRED" | "BONUS";
  points: number;
  description: string;
  orderId?: string;
  orderNumber?: string;
  date: string;
}

export interface LoyaltyRedemption {
  id: string;
  points: number;
  reward: string;
  date: string;
  status: "COMPLETED" | "PENDING";
}

export interface LoyaltyOrderEarned {
  orderId: string;
  orderNumber: string;
  amount: number;
  pointsEarned: number;
  date: string;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  currentTier: LoyaltyTier;
  currentPoints: number;
  redeemedPoints: number;
  availablePoints: number;
  tierProgress: number;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  pointHistory: LoyaltyPointHistory[];
  redemptions: LoyaltyRedemption[];
  ordersEarnedFrom: LoyaltyOrderEarned[];
}

export interface LoyaltyDashboardStats {
  totalPointsIssued: number;
  redeemedPoints: number;
  pendingRedemptions: number;
  topCustomersCount: number;
}

export const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000,
};

export const MOCK_LOYALTY_CUSTOMERS: CustomerLoyalty[] = [
  {
    id: "loy-001",
    customerId: "cust-002",
    customerName: "Skyline Infra Pvt Ltd",
    customerPhone: "+91 91234 56789",
    customerCity: "Pune",
    currentTier: "PLATINUM",
    currentPoints: 18500,
    redeemedPoints: 4200,
    availablePoints: 14300,
    tierProgress: 100,
    nextTier: null,
    pointsToNextTier: 0,
    pointHistory: [
      {
        id: "ph-001",
        type: "EARNED",
        points: 2500,
        description: "Order purchase",
        orderId: "ord-088",
        orderNumber: "BJW-2026-000088",
        date: "2026-07-15",
      },
      {
        id: "ph-002",
        type: "REDEEMED",
        points: 2000,
        description: "Redeemed for ₹2,000 discount",
        date: "2026-07-10",
      },
      {
        id: "ph-003",
        type: "BONUS",
        points: 500,
        description: "Platinum tier bonus",
        date: "2026-07-01",
      },
    ],
    redemptions: [
      {
        id: "lr-001",
        points: 2000,
        reward: "₹2,000 order discount",
        date: "2026-07-10",
        status: "COMPLETED",
      },
    ],
    ordersEarnedFrom: [
      {
        orderId: "ord-088",
        orderNumber: "BJW-2026-000088",
        amount: 250000,
        pointsEarned: 2500,
        date: "2026-07-15",
      },
      {
        orderId: "ord-072",
        orderNumber: "BJW-2026-000072",
        amount: 180000,
        pointsEarned: 1800,
        date: "2026-06-28",
      },
    ],
  },
  {
    id: "loy-002",
    customerId: "cust-001",
    customerName: "Ravi Teja Constructions",
    customerPhone: "+91 98765 43210",
    customerCity: "Mumbai",
    currentTier: "GOLD",
    currentPoints: 8200,
    redeemedPoints: 1500,
    availablePoints: 6700,
    tierProgress: 64,
    nextTier: "PLATINUM",
    pointsToNextTier: 6800,
    pointHistory: [
      {
        id: "ph-004",
        type: "EARNED",
        points: 1200,
        description: "Order purchase",
        orderId: "ord-130",
        orderNumber: "BJW-2026-000130",
        date: "2026-07-16",
      },
      {
        id: "ph-005",
        type: "REDEEMED",
        points: 1500,
        description: "Redeemed for free delivery",
        date: "2026-06-20",
      },
    ],
    redemptions: [
      {
        id: "lr-002",
        points: 1500,
        reward: "Free delivery voucher",
        date: "2026-06-20",
        status: "COMPLETED",
      },
    ],
    ordersEarnedFrom: [
      {
        orderId: "ord-130",
        orderNumber: "BJW-2026-000130",
        amount: 120000,
        pointsEarned: 1200,
        date: "2026-07-16",
      },
    ],
  },
  {
    id: "loy-003",
    customerId: "cust-007",
    customerName: "Urban Edge Projects",
    customerPhone: "+91 94321 09876",
    customerCity: "Ahmedabad",
    currentTier: "GOLD",
    currentPoints: 6800,
    redeemedPoints: 800,
    availablePoints: 6000,
    tierProgress: 45,
    nextTier: "PLATINUM",
    pointsToNextTier: 8200,
    pointHistory: [
      {
        id: "ph-006",
        type: "EARNED",
        points: 4500,
        description: "Bulk order purchase",
        orderId: "ord-088",
        orderNumber: "BJW-2026-000088",
        date: "2026-07-18",
      },
    ],
    redemptions: [],
    ordersEarnedFrom: [
      {
        orderId: "ord-088",
        orderNumber: "BJW-2026-000088",
        amount: 450000,
        pointsEarned: 4500,
        date: "2026-07-18",
      },
    ],
  },
  {
    id: "loy-004",
    customerId: "cust-003",
    customerName: "Metro Build Solutions",
    customerPhone: "+91 99887 76655",
    customerCity: "Delhi NCR",
    currentTier: "SILVER",
    currentPoints: 2800,
    redeemedPoints: 500,
    availablePoints: 2300,
    tierProgress: 45,
    nextTier: "GOLD",
    pointsToNextTier: 2200,
    pointHistory: [
      {
        id: "ph-007",
        type: "EARNED",
        points: 800,
        description: "Order purchase",
        date: "2026-07-12",
      },
      {
        id: "ph-008",
        type: "REDEEMED",
        points: 500,
        description: "₹500 discount coupon",
        date: "2026-07-05",
      },
    ],
    redemptions: [
      {
        id: "lr-003",
        points: 500,
        reward: "₹500 discount coupon",
        date: "2026-07-05",
        status: "COMPLETED",
      },
    ],
    ordersEarnedFrom: [
      {
        orderId: "ord-105",
        orderNumber: "BJW-2026-000105",
        amount: 80000,
        pointsEarned: 800,
        date: "2026-07-12",
      },
    ],
  },
  {
    id: "loy-005",
    customerId: "cust-006",
    customerName: "Heritage Construction Co",
    customerPhone: "+91 95432 10987",
    customerCity: "Chennai",
    currentTier: "SILVER",
    currentPoints: 1500,
    redeemedPoints: 0,
    availablePoints: 1500,
    tierProgress: 12,
    nextTier: "GOLD",
    pointsToNextTier: 3500,
    pointHistory: [
      {
        id: "ph-009",
        type: "EARNED",
        points: 1500,
        description: "First order bonus + purchase",
        date: "2026-07-08",
      },
    ],
    redemptions: [],
    ordersEarnedFrom: [
      {
        orderId: "ord-098",
        orderNumber: "BJW-2026-000098",
        amount: 95000,
        pointsEarned: 950,
        date: "2026-07-08",
      },
    ],
  },
  {
    id: "loy-006",
    customerId: "cust-009",
    customerName: "Nexus Buildtech",
    customerPhone: "+91 92109 87654",
    customerCity: "Kolkata",
    currentTier: "BRONZE",
    currentPoints: 650,
    redeemedPoints: 0,
    availablePoints: 650,
    tierProgress: 65,
    nextTier: "SILVER",
    pointsToNextTier: 350,
    pointHistory: [
      {
        id: "ph-010",
        type: "EARNED",
        points: 650,
        description: "Order purchase",
        date: "2026-07-14",
      },
    ],
    redemptions: [],
    ordersEarnedFrom: [
      {
        orderId: "ord-112",
        orderNumber: "BJW-2026-000112",
        amount: 65000,
        pointsEarned: 650,
        date: "2026-07-14",
      },
    ],
  },
  {
    id: "loy-007",
    customerId: "cust-011",
    customerName: "Coastal Infra Ltd",
    customerPhone: "+91 90987 65432",
    customerCity: "Kochi",
    currentTier: "GOLD",
    currentPoints: 9200,
    redeemedPoints: 3000,
    availablePoints: 6200,
    tierProgress: 78,
    nextTier: "PLATINUM",
    pointsToNextTier: 5800,
    pointHistory: [
      {
        id: "ph-011",
        type: "EARNED",
        points: 3200,
        description: "Bulk cement order",
        date: "2026-07-11",
      },
      {
        id: "ph-012",
        type: "REDEEMED",
        points: 3000,
        description: "Premium tool kit reward",
        date: "2026-07-03",
      },
    ],
    redemptions: [
      {
        id: "lr-004",
        points: 3000,
        reward: "Premium tool kit",
        date: "2026-07-03",
        status: "PENDING",
      },
    ],
    ordersEarnedFrom: [
      {
        orderId: "ord-115",
        orderNumber: "BJW-2026-000115",
        amount: 320000,
        pointsEarned: 3200,
        date: "2026-07-11",
      },
    ],
  },
  {
    id: "loy-008",
    customerId: "cust-005",
    customerName: "Apex Realty Group",
    customerPhone: "+91 96543 21098",
    customerCity: "Hyderabad",
    currentTier: "BRONZE",
    currentPoints: 320,
    redeemedPoints: 0,
    availablePoints: 320,
    tierProgress: 32,
    nextTier: "SILVER",
    pointsToNextTier: 680,
    pointHistory: [
      {
        id: "ph-013",
        type: "EARNED",
        points: 320,
        description: "Order purchase",
        date: "2026-07-19",
      },
    ],
    redemptions: [],
    ordersEarnedFrom: [
      {
        orderId: "ord-110",
        orderNumber: "BJW-2026-000110",
        amount: 32000,
        pointsEarned: 320,
        date: "2026-07-19",
      },
    ],
  },
];

export function computeLoyaltyStats(
  customers: CustomerLoyalty[],
): LoyaltyDashboardStats {
  const totalIssued = customers.reduce((sum, c) => sum + c.currentPoints, 0);
  const redeemed = customers.reduce((sum, c) => sum + c.redeemedPoints, 0);
  const pending = customers.reduce(
    (sum, c) =>
      sum + c.redemptions.filter((r) => r.status === "PENDING").length,
    0,
  );

  return {
    totalPointsIssued: totalIssued,
    redeemedPoints: redeemed,
    pendingRedemptions: pending,
    topCustomersCount: customers.filter(
      (c) => c.currentTier === "GOLD" || c.currentTier === "PLATINUM",
    ).length,
  };
}
