import {
  computeBulkProcurementStats,
  MOCK_BULK_PROCUREMENT,
  type BulkProcurementDashboardStats,
  type BulkProcurementRequest,
  type BulkProcurementStatus,
} from "@/mock/mockBulkProcurement";

const MOCK_DELAY_MS = 300;

export const BULK_PROCUREMENT_PAGE_SIZE = 10;

export type BulkStatusFilter = "all" | BulkProcurementStatus;

export type BulkQuickFilter =
  "all" | "open" | "assigned" | "completed" | "pipeline";

export interface BulkProcurementFilters {
  search: string;
  status: BulkStatusFilter;
  quickFilter: BulkQuickFilter;
}

export const EMPTY_BULK_PROCUREMENT_FILTERS: BulkProcurementFilters = {
  search: "",
  status: "all",
  quickFilter: "all",
};

export interface BulkProcurementQueryParams {
  page: number;
  limit: number;
  filters: BulkProcurementFilters;
}

export interface BulkProcurementQueryResult {
  data: BulkProcurementRequest[];
  total: number;
  totalPages: number;
  page: number;
}

const procurementStore = structuredClone(MOCK_BULK_PROCUREMENT);

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterProcurement(
  items: BulkProcurementRequest[],
  filters: BulkProcurementFilters,
): BulkProcurementRequest[] {
  let result = [...items];

  switch (filters.quickFilter) {
    case "open":
      result = result.filter((r) => r.status === "OPEN");
      break;
    case "assigned":
      result = result.filter(
        (r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS",
      );
      break;
    case "completed":
      result = result.filter((r) => r.status === "COMPLETED");
      break;
    case "pipeline":
      result = result.filter((r) =>
        ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(r.status),
      );
      break;
    default:
      break;
  }

  if (filters.quickFilter === "all" && filters.status !== "all") {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.assignedExecutiveName?.toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Future: GET /admin/bulk-procurement */
export async function getBulkProcurementRequests(
  params: BulkProcurementQueryParams,
): Promise<BulkProcurementQueryResult> {
  await delay();
  const filtered = filterProcurement(procurementStore, params.filters);
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

/** Future: GET /admin/bulk-procurement/stats */
export async function getBulkProcurementStats(): Promise<BulkProcurementDashboardStats> {
  await delay();
  return computeBulkProcurementStats(procurementStore);
}

/** Future: GET /admin/bulk-procurement/:id */
export async function getBulkProcurementById(
  id: string,
): Promise<BulkProcurementRequest | null> {
  await delay();
  return procurementStore.find((r) => r.id === id) ?? null;
}

export async function getLatestBulkLeads(limit = 5) {
  await delay(120);
  return [...procurementStore]
    .filter((r) => r.status === "OPEN" || r.status === "ASSIGNED")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
