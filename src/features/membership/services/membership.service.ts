import {
  computeMembershipStats,
  MOCK_MEMBERSHIPS,
  type CustomerMembership,
  type MembershipDashboardStats,
  type MembershipStatus,
} from "@/mock/mockMemberships";

const MOCK_DELAY_MS = 300;

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

const membershipsStore = structuredClone(MOCK_MEMBERSHIPS);

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterMemberships(
  items: CustomerMembership[],
  filters: MembershipFilters,
): CustomerMembership[] {
  let result = [...items];

  if (filters.status !== "all") {
    result = result.filter((m) => m.status === filters.status);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.customerName.toLowerCase().includes(q) ||
        m.customerPhone.includes(q) ||
        m.customerCity.toLowerCase().includes(q) ||
        m.membership.toLowerCase().includes(q),
    );
  }

  return result;
}

/** Future: GET /admin/memberships */
export async function getMemberships(
  params: MembershipQueryParams,
): Promise<MembershipQueryResult> {
  await delay();
  const filtered = filterMemberships(membershipsStore, params.filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * params.limit;

  return {
    data: filtered.slice(start, start + params.limit),
    total,
    totalPages,
    page,
  };
}

/** Future: GET /admin/memberships/stats */
export async function getMembershipStats(): Promise<MembershipDashboardStats> {
  await delay();
  return computeMembershipStats(membershipsStore);
}

/** Future: GET /admin/memberships/:id */
export async function getMembershipById(
  id: string,
): Promise<CustomerMembership | null> {
  await delay();
  return membershipsStore.find((m) => m.id === id) ?? null;
}

/** Future: POST /admin/memberships/:id/renew */
export async function renewMembership(id: string): Promise<CustomerMembership> {
  await delay();
  const index = membershipsStore.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Membership not found");

  const membership = membershipsStore[index];
  const renewed: CustomerMembership = {
    ...membership,
    status: "ACTIVE",
    purchaseDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    paymentStatus: "PAID",
  };
  membershipsStore[index] = renewed;
  return structuredClone(renewed);
}

/** Future: POST /admin/memberships/:id/cancel */
export async function cancelMembership(
  id: string,
): Promise<CustomerMembership> {
  await delay();
  const index = membershipsStore.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Membership not found");

  membershipsStore[index] = {
    ...membershipsStore[index],
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
  };
  return structuredClone(membershipsStore[index]);
}

export async function getRecentMembershipPurchases(
  limit = 5,
): Promise<CustomerMembership[]> {
  await delay(120);
  return [...membershipsStore]
    .sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    )
    .slice(0, limit);
}
