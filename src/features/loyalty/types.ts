export interface LoyaltyPointHistory {
  id: string;
  type: "EARNED" | "REDEEMED" | "EXPIRED" | "BONUS" | "ADJUSTMENT";
  points: number;
  description: string;
  orderId?: string;
  orderNumber?: string;
  balanceAfter?: number;
  status?: "COMPLETED" | "PENDING" | "REVERSED" | "FAILED";
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
  customerCompany?: string;
  currentPoints: number;
  lifetimeEarned: number;
  redeemedPoints: number;
  lifetimeRedeemed: number;
  availablePoints: number;
  firstOrderBonusClaimed?: boolean;
  freeBikeDeliveriesAllowed?: number;
  freeBikeDeliveriesUsed?: number;
  freeBikeDeliveriesRemaining?: number;
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
