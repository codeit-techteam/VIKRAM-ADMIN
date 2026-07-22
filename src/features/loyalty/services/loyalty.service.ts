import api, { getApiErrorMessage } from "@/services/api";
import {
  TIER_THRESHOLDS,
  type CustomerLoyalty,
  type LoyaltyDashboardStats,
  type LoyaltyTier,
} from "@/mock/mockLoyalty";

export const LOYALTY_PAGE_SIZE = 10;

export type LoyaltyTierFilter = "all" | LoyaltyTier;

export interface LoyaltyFilters {
  search: string;
  tier: LoyaltyTierFilter;
}

export const EMPTY_LOYALTY_FILTERS: LoyaltyFilters = {
  search: "",
  tier: "all",
};

export interface LoyaltyQueryParams {
  page: number;
  limit: number;
  filters: LoyaltyFilters;
}

export interface LoyaltyQueryResult {
  data: CustomerLoyalty[];
  total: number;
  totalPages: number;
  page: number;
}

interface LoyaltyAccountApiRow {
  id: string;
  customerId: string;
  currentPoints: number;
  redeemedPoints: number;
  availablePoints: number;
  tier: LoyaltyTier;
  customer: {
    id: string;
    phone: string;
    fullName: string;
  };
  customerCity?: string | null;
}

interface LoyaltyListResponse {
  data: LoyaltyAccountApiRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LoyaltyStatsResponse {
  totalPointsIssued: number;
  redeemedPoints: number;
  pendingRedemptions: number;
  activeAccounts: number;
  tierDistribution: Array<{ tier: LoyaltyTier; count: number }>;
}

function computeTierProgress(
  tier: LoyaltyTier,
  points: number,
): {
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  tierProgress: number;
} {
  const tiers: LoyaltyTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const index = tiers.indexOf(tier);

  if (index >= tiers.length - 1) {
    return { nextTier: null, pointsToNextTier: 0, tierProgress: 100 };
  }

  const nextTier = tiers[index + 1];
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const span = nextThreshold - currentThreshold;
  const progressInTier = points - currentThreshold;

  return {
    nextTier,
    pointsToNextTier: Math.max(0, nextThreshold - points),
    tierProgress:
      span > 0 ? Math.min(100, Math.round((progressInTier / span) * 100)) : 0,
  };
}

function mapAccountRow(row: LoyaltyAccountApiRow): CustomerLoyalty {
  const tierProgress = computeTierProgress(row.tier, row.currentPoints);

  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.fullName,
    customerPhone: row.customer.phone,
    customerCity: row.customerCity ?? "—",
    currentTier: row.tier,
    currentPoints: row.currentPoints,
    redeemedPoints: row.redeemedPoints,
    availablePoints: row.availablePoints,
    tierProgress: tierProgress.tierProgress,
    nextTier: tierProgress.nextTier,
    pointsToNextTier: tierProgress.pointsToNextTier,
    pointHistory: [],
    redemptions: [],
    ordersEarnedFrom: [],
  };
}

function filterClientSide(
  items: CustomerLoyalty[],
  filters: LoyaltyFilters,
): CustomerLoyalty[] {
  let result = [...items];

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.includes(q) ||
        c.customerCity.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function getLoyaltyCustomers(
  params: LoyaltyQueryParams,
): Promise<LoyaltyQueryResult> {
  try {
    const { data: response } = await api.get<{
      data: LoyaltyListResponse;
    }>("/admin/loyalty", {
      params: {
        page: params.page,
        limit: params.limit,
        tier: params.filters.tier === "all" ? undefined : params.filters.tier,
      },
    });

    const mapped = response.data.data.map(mapAccountRow);
    const filtered = filterClientSide(mapped, params.filters);

    return {
      data: filtered,
      total: response.data.meta.total,
      totalPages: response.data.meta.totalPages,
      page: response.data.meta.page,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getLoyaltyStats(): Promise<LoyaltyDashboardStats> {
  try {
    const { data: response } = await api.get<{ data: LoyaltyStatsResponse }>(
      "/admin/loyalty/stats",
    );

    return {
      totalPointsIssued: response.data.totalPointsIssued,
      redeemedPoints: response.data.redeemedPoints,
      pendingRedemptions: response.data.pendingRedemptions,
      topCustomersCount: response.data.activeAccounts,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getLoyaltyById(
  id: string,
): Promise<CustomerLoyalty | null> {
  try {
    const { data: response } = await api.get<{
      data: LoyaltyAccountApiRow & {
        transactions?: Array<{
          id: string;
          points: number;
          type: string;
          reason: string;
          referenceOrderId?: string | null;
          createdAt: string;
        }>;
      };
    }>(`/admin/loyalty/${id}`);

    const account = mapAccountRow(response.data);

    account.pointHistory = (response.data.transactions ?? []).map((tx) => ({
      id: tx.id,
      type:
        tx.type === "EARN"
          ? "EARNED"
          : tx.type === "REDEEM"
            ? "REDEEMED"
            : tx.type === "EXPIRE"
              ? "EXPIRED"
              : "BONUS",
      points: tx.points,
      description: tx.reason,
      orderId: tx.referenceOrderId ?? undefined,
      date: tx.createdAt,
    }));

    account.redemptions = (response.data.transactions ?? [])
      .filter((tx) => tx.type === "REDEEM")
      .map((tx) => ({
        id: tx.id,
        points: tx.points,
        reward: tx.reason,
        date: tx.createdAt,
        status: "COMPLETED" as const,
      }));

    account.ordersEarnedFrom = (response.data.transactions ?? [])
      .filter((tx) => tx.type === "EARN")
      .map((tx) => ({
        orderId: tx.referenceOrderId ?? tx.id,
        orderNumber: tx.reason.replace(/^Points earned on order /, ""),
        amount: 0,
        pointsEarned: tx.points,
        date: tx.createdAt,
      }));

    return account;
  } catch {
    return null;
  }
}

export async function adjustLoyaltyPoints(
  customerId: string,
  points: number,
  reason: string,
) {
  const { data } = await api.patch(`/admin/loyalty/${customerId}/adjust`, {
    points,
    reason,
  });
  return data;
}

export async function creditLoyaltyPoints(
  customerId: string,
  points: number,
  reason: string,
) {
  const { data } = await api.post(`/admin/loyalty/${customerId}/reward`, {
    points,
    reason,
  });
  return data;
}

export async function debitLoyaltyPoints(
  customerId: string,
  points: number,
  reason: string,
) {
  const { data } = await api.post(`/admin/loyalty/${customerId}/redeem`, {
    points,
    reason,
  });
  return data;
}

export async function getLoyaltyLeaderboard(limit = 10) {
  const { data } = await api.get("/admin/loyalty/leaderboard", {
    params: { limit },
  });
  return data.data;
}

export async function getLoyaltyTierDistribution() {
  const { data } = await api.get<{ data: LoyaltyStatsResponse }>(
    "/admin/loyalty/stats",
  );
  return data.data.tierDistribution;
}
