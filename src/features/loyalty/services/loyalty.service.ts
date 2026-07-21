import {
  computeLoyaltyStats,
  MOCK_LOYALTY_CUSTOMERS,
  type CustomerLoyalty,
  type LoyaltyDashboardStats,
  type LoyaltyTier,
} from "@/mock/mockLoyalty";

const MOCK_DELAY_MS = 300;

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

const loyaltyStore = structuredClone(MOCK_LOYALTY_CUSTOMERS);

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterLoyalty(
  items: CustomerLoyalty[],
  filters: LoyaltyFilters,
): CustomerLoyalty[] {
  let result = [...items];

  if (filters.tier !== "all") {
    result = result.filter((c) => c.currentTier === filters.tier);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.includes(q) ||
        c.customerCity.toLowerCase().includes(q),
    );
  }

  return result.sort((a, b) => b.availablePoints - a.availablePoints);
}

/** Future: GET /admin/loyalty */
export async function getLoyaltyCustomers(
  params: LoyaltyQueryParams,
): Promise<LoyaltyQueryResult> {
  await delay();
  const filtered = filterLoyalty(loyaltyStore, params.filters);
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

/** Future: GET /admin/loyalty/stats */
export async function getLoyaltyStats(): Promise<LoyaltyDashboardStats> {
  await delay();
  return computeLoyaltyStats(loyaltyStore);
}

/** Future: GET /admin/loyalty/:id */
export async function getLoyaltyById(
  id: string,
): Promise<CustomerLoyalty | null> {
  await delay();
  return loyaltyStore.find((c) => c.id === id) ?? null;
}
