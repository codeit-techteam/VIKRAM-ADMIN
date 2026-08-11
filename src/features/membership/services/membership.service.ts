import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  CustomerMembership,
  MembershipDashboardStats,
  MembershipPaymentStatus,
  MembershipPlanType,
  MembershipStatus,
} from "@/features/membership/types";

export const MEMBERSHIP_PAGE_SIZE = 10;

export type MembershipStatusFilter = "all" | MembershipStatus;

export interface MembershipFilters {
  search: string;
  status: MembershipStatusFilter;
}

export const EMPTY_MEMBERSHIP_FILTERS: MembershipFilters = {
  search: "",
  status: "all",
};

export interface MembershipQueryParams {
  page: number;
  limit: number;
  filters: MembershipFilters;
}

export interface MembershipQueryResult {
  data: CustomerMembership[];
  total: number;
  totalPages: number;
  page: number;
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiMembershipRow = {
  id: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  purchaseDate: string;
  expiryDate: string;
  amount?: number;
  customerCity?: string | null;
  customerCompany?: string | null;
  customer?: {
    id: string;
    phone: string;
    fullName: string | null;
    profile?: { companyName?: string | null } | null;
  } | null;
  plan?: {
    id: string;
    name: string;
    price: number | string;
    benefits?: unknown;
  } | null;
  history?: Array<{
    id: string;
    plan: string;
    purchaseDate: string;
    expiryDate: string;
    amount: number;
    status: string;
    paymentStatus: string;
  }>;
};

function mapPlanName(name?: string | null): MembershipPlanType {
  const upper = (name ?? "").toUpperCase();
  if (upper.includes("PLATINUM") || upper.includes("ENTERPRISE")) {
    return upper.includes("PLATINUM") ? "PLATINUM" : name ?? "Enterprise";
  }
  if (upper.includes("GOLD")) return "GOLD";
  if (upper.includes("SILVER")) return "SILVER";
  return name?.trim() || "—";
}

function mapStatus(status: string, expiryDate: string): MembershipStatus {
  if (status === "CANCELLED") return "CANCELLED";
  if (status === "EXPIRED") return "EXPIRED";
  if (status === "PENDING") return "PENDING";
  if (status === "EXPIRING_SOON") return "EXPIRING_SOON";

  const expiry = new Date(expiryDate).getTime();
  const soon = Date.now() + 30 * 24 * 60 * 60 * 1000;
  if (Number.isFinite(expiry) && expiry < Date.now()) return "EXPIRED";
  if (Number.isFinite(expiry) && expiry <= soon) return "EXPIRING_SOON";
  return "ACTIVE";
}

function mapPaymentStatus(status: string): MembershipPaymentStatus {
  if (status === "PAID") return "PAID";
  if (status === "REFUNDED") return "REFUNDED";
  if (status === "FAILED") return "FAILED";
  return "PENDING";
}

function mapBenefits(raw: unknown): CustomerMembership["benefits"] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    if (typeof item === "string") {
      return { id: `b-${index}`, label: item, enabled: true };
    }
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      return {
        id: String(record.id ?? `b-${index}`),
        label: String(record.label ?? record.name ?? "Benefit"),
        enabled: Boolean(record.enabled ?? true),
      };
    }
    return { id: `b-${index}`, label: "Benefit", enabled: true };
  });
}

function mapMembership(row: ApiMembershipRow): CustomerMembership {
  const planName = row.plan?.name ?? undefined;
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer?.fullName?.trim() || row.customer?.phone || "—",
    customerPhone: row.customer?.phone ?? "—",
    customerCity: row.customerCity ?? "—",
    customerCompany:
      row.customerCompany ?? row.customer?.profile?.companyName ?? undefined,
    membership: mapPlanName(planName),
    planName,
    purchaseDate: String(row.purchaseDate).slice(0, 10),
    expiryDate: String(row.expiryDate).slice(0, 10),
    status: mapStatus(row.status, row.expiryDate),
    paymentStatus: mapPaymentStatus(row.paymentStatus),
    amount: Number(row.amount ?? row.plan?.price ?? 0),
    benefits: mapBenefits(row.plan?.benefits),
    history: (row.history ?? []).map((entry) => ({
      id: entry.id,
      plan: mapPlanName(entry.plan),
      purchaseDate: String(entry.purchaseDate).slice(0, 10),
      expiryDate: String(entry.expiryDate).slice(0, 10),
      amount: Number(entry.amount ?? 0),
      status: mapStatus(entry.status, entry.expiryDate),
      paymentStatus: mapPaymentStatus(entry.paymentStatus),
    })),
  };
}

export async function getMemberships(
  params: MembershipQueryParams,
): Promise<MembershipQueryResult> {
  const { data } = await api.get<
    ApiEnvelope<{
      data: ApiMembershipRow[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>
  >(API_ENDPOINTS.MEMBERSHIPS.BASE, {
    params: {
      page: params.page,
      limit: params.limit,
      status:
        params.filters.status !== "all" ? params.filters.status : undefined,
      search: params.filters.search.trim() || undefined,
    },
  });

  return {
    data: data.data.data.map(mapMembership),
    total: data.data.meta.total,
    totalPages: data.data.meta.totalPages,
    page: data.data.meta.page,
  };
}

export async function getMembershipStats(): Promise<MembershipDashboardStats> {
  const { data } = await api.get<ApiEnvelope<MembershipDashboardStats>>(
    API_ENDPOINTS.MEMBERSHIPS.STATS,
  );
  return data.data;
}

export async function getMembershipById(
  id: string,
): Promise<CustomerMembership> {
  const { data } = await api.get<ApiEnvelope<ApiMembershipRow>>(
    API_ENDPOINTS.MEMBERSHIPS.BY_ID(id),
  );
  return mapMembership(data.data);
}

export async function renewMembership(id: string): Promise<CustomerMembership> {
  const { data } = await api.patch<ApiEnvelope<ApiMembershipRow>>(
    API_ENDPOINTS.MEMBERSHIPS.RENEW(id),
  );
  return mapMembership(data.data);
}

export async function cancelMembership(
  id: string,
): Promise<CustomerMembership> {
  const { data } = await api.patch<ApiEnvelope<ApiMembershipRow>>(
    API_ENDPOINTS.MEMBERSHIPS.CANCEL(id),
  );
  return mapMembership(data.data);
}

export async function getRecentMembershipPurchases(
  limit = 5,
): Promise<CustomerMembership[]> {
  const result = await getMemberships({
    page: 1,
    limit,
    filters: EMPTY_MEMBERSHIP_FILTERS,
  });
  return result.data;
}
