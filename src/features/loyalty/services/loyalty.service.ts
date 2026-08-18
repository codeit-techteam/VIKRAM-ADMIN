import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api, { getApiErrorMessage } from "@/services/api";
import type {
  CustomerLoyalty,
  LoyaltyDashboardStats,
  LoyaltyPointHistory,
} from "@/features/loyalty/types";

export const LOYALTY_PAGE_SIZE = 10;

export interface LoyaltyFilters {
  search: string;
}

export const EMPTY_LOYALTY_FILTERS: LoyaltyFilters = {
  search: "",
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
  lifetimeEarned?: number;
  redeemedPoints: number;
  lifetimeRedeemed?: number;
  availablePoints: number;
  customerCity?: string | null;
  customerCompany?: string | null;
  firstOrderBonusClaimed?: boolean;
  freeBikeDeliveriesAllowed?: number;
  freeBikeDeliveriesUsed?: number;
  freeBikeDeliveriesRemaining?: number;
  customer: {
    id: string;
    phone: string;
    fullName: string | null;
    profile?: { companyName?: string | null } | null;
  };
  transactions?: Array<{
    id: string;
    points: number;
    type: string;
    reason: string;
    referenceId?: string | null;
    referenceOrderId?: string | null;
    closingPoints?: number | null;
    createdAt: string;
  }>;
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
  pendingRedemptions?: number;
  pending?: number;
  activeAccounts?: number;
  topCustomersCount?: number;
  topCustomers?: number;
}

function mapHistoryType(type: string, reason: string): LoyaltyPointHistory["type"] {
  if (type === "REDEEM") return "REDEEMED";
  if (type === "EXPIRE") return "EXPIRED";
  if (type === "ADJUSTMENT" || type === "ADMIN") return "ADJUSTMENT";
  if (
    reason.toLowerCase().includes("first order") ||
    reason.toLowerCase().includes("bonus")
  ) {
    return "BONUS";
  }
  return "EARNED";
}

function mapAccountRow(row: LoyaltyAccountApiRow): CustomerLoyalty {
  const lifetimeEarned = row.lifetimeEarned ?? row.currentPoints;
  const lifetimeRedeemed = row.lifetimeRedeemed ?? row.redeemedPoints;

  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.fullName?.trim() || row.customer.phone || "—",
    customerPhone: row.customer.phone,
    customerCity: row.customerCity ?? "—",
    customerCompany:
      row.customerCompany ?? row.customer.profile?.companyName ?? undefined,
    currentPoints: row.currentPoints,
    lifetimeEarned,
    redeemedPoints: row.redeemedPoints,
    lifetimeRedeemed,
    availablePoints: row.availablePoints,
    firstOrderBonusClaimed: row.firstOrderBonusClaimed,
    freeBikeDeliveriesAllowed: row.freeBikeDeliveriesAllowed,
    freeBikeDeliveriesUsed: row.freeBikeDeliveriesUsed,
    freeBikeDeliveriesRemaining: row.freeBikeDeliveriesRemaining,
    pointHistory: [],
    redemptions: [],
    ordersEarnedFrom: [],
  };
}

function attachTransactions(
  account: CustomerLoyalty,
  transactions: NonNullable<LoyaltyAccountApiRow["transactions"]>,
): CustomerLoyalty {
  account.pointHistory = transactions.map((tx) => ({
    id: tx.id,
    type: mapHistoryType(tx.type, tx.reason),
    points: tx.points,
    description: tx.reason,
    orderId: tx.referenceOrderId ?? undefined,
    orderNumber: tx.referenceId ?? undefined,
    balanceAfter: tx.closingPoints ?? undefined,
    status: "COMPLETED",
    date: tx.createdAt,
  }));

  account.redemptions = transactions
    .filter((tx) => tx.type === "REDEEM")
    .map((tx) => ({
      id: tx.id,
      points: tx.points,
      reward: tx.reason,
      date: tx.createdAt,
      status: "COMPLETED" as const,
    }));

  account.ordersEarnedFrom = transactions
    .filter((tx) => tx.type === "EARN")
    .map((tx) => ({
      orderId: tx.referenceOrderId ?? tx.id,
      orderNumber:
        tx.referenceId?.replace(/^ORDER_EARNED:/, "") ||
        tx.reason.replace(/^Points earned on order /, "") ||
        "—",
      amount: 0,
      pointsEarned: tx.points,
      date: tx.createdAt,
    }));

  return account;
}

export async function getLoyaltyCustomers(
  params: LoyaltyQueryParams,
): Promise<LoyaltyQueryResult> {
  try {
    const { data: response } = await api.get<{
      data: LoyaltyListResponse;
    }>(API_ENDPOINTS.LOYALTY.BASE, {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.filters.search.trim() || undefined,
      },
    });

    return {
      data: response.data.data.map(mapAccountRow),
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
      API_ENDPOINTS.LOYALTY.STATS,
    );

    const stats = response.data;
    return {
      totalPointsIssued: stats.totalPointsIssued,
      redeemedPoints: stats.redeemedPoints,
      pendingRedemptions: stats.pendingRedemptions ?? stats.pending ?? 0,
      topCustomersCount: stats.topCustomersCount ?? stats.topCustomers ?? 0,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getLoyaltyByCustomerId(
  customerId: string,
): Promise<CustomerLoyalty> {
  try {
    const { data: response } = await api.get<{ data: LoyaltyAccountApiRow }>(
      API_ENDPOINTS.LOYALTY.BY_CUSTOMER(customerId),
    );

    return attachTransactions(mapAccountRow(response.data), response.data.transactions ?? []);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/** @deprecated Prefer getLoyaltyByCustomerId */
export async function getLoyaltyById(
  customerId: string,
): Promise<CustomerLoyalty | null> {
  try {
    return await getLoyaltyByCustomerId(customerId);
  } catch {
    return null;
  }
}

export async function adjustLoyaltyPoints(
  customerId: string,
  points: number,
  reason: string,
) {
  const { data } = await api.patch(API_ENDPOINTS.LOYALTY.ADJUST(customerId), {
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
  const { data } = await api.post(API_ENDPOINTS.LOYALTY.REWARD(customerId), {
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
  const { data } = await api.post(API_ENDPOINTS.LOYALTY.REDEEM(customerId), {
    points,
    reason,
  });
  return data;
}

export async function getLoyaltyLeaderboard(limit = 10) {
  const { data } = await api.get(API_ENDPOINTS.LOYALTY.LEADERBOARD, {
    params: { limit },
  });
  return data.data;
}
