import type { PaginationMeta } from "@/types/api";
import type {
  ErpActivityLog,
  HubInventoryEntry,
  SubHub,
} from "@/types/erp.types";
import type {
  RequisitionListItem,
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";
import {
  formatRequisitionDateOnly,
  formatRequisitionTimeOnly,
  getRequisitionDetail,
  paginateRequisitions,
} from "@/mock/requisitions";

export const HUB_REQUISITION_PAGE_SIZE = 10;

export interface HubRequisitionFilters {
  status: RequisitionStatus | "all";
  hubId: string;
  material: string;
  priority: RequisitionPriority | "all";
  date: string;
}

export const EMPTY_HUB_REQUISITION_FILTERS: HubRequisitionFilters = {
  status: "all",
  hubId: "all",
  material: "all",
  priority: "all",
  date: "",
};

export interface HubRequisitionStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface HubRequisitionQueryParams {
  page?: number;
  limit?: number;
  filters?: Partial<HubRequisitionFilters>;
  search?: string;
}

export interface HubRequisitionInventoryContext {
  currentQty: number;
  minimumStock: number;
  unit: string;
  sku: string;
  lastUpdated?: string;
}

export interface HubRequisitionTimelineEntry {
  id: string;
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
  variant: "default" | "success" | "danger" | "info";
}

export interface HubRequisitionDetailView {
  requisition: ReturnType<typeof getRequisitionDetail>;
  hubManager: string;
  hubCity: string;
  hubRegion: string;
  inventory: HubRequisitionInventoryContext | null;
  timeline: HubRequisitionTimelineEntry[];
}

function isSameDay(isoDate: string, dateValue: string): boolean {
  const created = new Date(isoDate);
  const filter = new Date(dateValue);
  return (
    created.getFullYear() === filter.getFullYear() &&
    created.getMonth() === filter.getMonth() &&
    created.getDate() === filter.getDate()
  );
}

function isCompletedStatus(status: RequisitionStatus): boolean {
  return status === "COMPLETED" || status === "TRANSFERRED";
}

export function computeHubRequisitionStats(
  items: RequisitionListItem[],
): HubRequisitionStats {
  return {
    pending: items.filter((item) => item.status === "PENDING").length,
    approved: items.filter((item) => item.status === "APPROVED").length,
    rejected: items.filter((item) => item.status === "REJECTED").length,
    completed: items.filter((item) => isCompletedStatus(item.status)).length,
  };
}

export function collectHubRequisitionMaterials(
  items: RequisitionListItem[],
): string[] {
  return Array.from(new Set(items.map((item) => item.material))).sort();
}

function matchesHubFilters(
  item: RequisitionListItem,
  filters: Partial<HubRequisitionFilters>,
): boolean {
  if (filters.status && filters.status !== "all") {
    if (filters.status === "COMPLETED") {
      if (!isCompletedStatus(item.status)) return false;
    } else if (item.status !== filters.status) {
      return false;
    }
  }

  if (filters.hubId && filters.hubId !== "all") {
    if (item.hubId !== filters.hubId) return false;
  }

  if (filters.material && filters.material !== "all") {
    if (item.material !== filters.material) return false;
  }

  if (filters.priority && filters.priority !== "all") {
    if (item.priority !== filters.priority) return false;
  }

  if (filters.date) {
    if (!isSameDay(item.createdAt, filters.date)) return false;
  }

  return true;
}

function matchesSearch(item: RequisitionListItem, search?: string): boolean {
  if (!search?.trim()) return true;

  const query = search.trim().toLowerCase();
  const haystack = [
    item.requestId,
    item.hubName,
    item.requestedBy.name,
    item.requestedBy.role,
    item.material,
    item.materialSpec,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function filterHubRequisitions(
  items: RequisitionListItem[],
  params: HubRequisitionQueryParams,
): RequisitionListItem[] {
  const filters = params.filters ?? {};

  return items
    .filter((item) => matchesHubFilters(item, filters))
    .filter((item) => matchesSearch(item, params.search))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function fetchHubRequisitions(
  items: RequisitionListItem[],
  params: HubRequisitionQueryParams = {},
): {
  data: RequisitionListItem[];
  meta: PaginationMeta;
  stats: HubRequisitionStats;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? HUB_REQUISITION_PAGE_SIZE;
  const filtered = filterHubRequisitions(items, params);
  const paginated = paginateRequisitions(filtered, page, limit);

  return {
    ...paginated,
    stats: computeHubRequisitionStats(items),
  };
}

export function resolveHubInventoryContext(
  hubInventory: HubInventoryEntry[],
  hubId: string,
  materialId: string,
): HubRequisitionInventoryContext | null {
  const entry = hubInventory.find(
    (item) => item.hubId === hubId && item.materialId === materialId,
  );

  if (!entry) return null;

  return {
    currentQty: entry.quantity,
    minimumStock: entry.reorderLevel ?? entry.minimumRequired,
    unit: entry.unit,
    sku: entry.sku,
    lastUpdated: entry.lastUpdated,
  };
}

export function resolveHubManager(
  subHubs: SubHub[],
  hubId: string,
  fallbackName: string,
): { managerName: string; city: string; region: string } {
  const hub = subHubs.find((item) => item.id === hubId);

  return {
    managerName: hub?.managerName ?? fallbackName,
    city: hub?.city ?? "—",
    region: hub?.region ?? "—",
  };
}

export function buildHubRequisitionTimeline(
  requisition: RequisitionListItem,
  activityLogs: ErpActivityLog[],
): HubRequisitionTimelineEntry[] {
  const entries: HubRequisitionTimelineEntry[] = [
    {
      id: `${requisition.id}-created`,
      title: "Requisition Raised",
      description: `${requisition.material} — ${requisition.requestedQty} ${requisition.unit}`,
      actor: requisition.requestedBy.name,
      timestamp: requisition.createdAt,
      variant: "info",
    },
  ];

  const relatedLogs = activityLogs
    .filter(
      (log) =>
        log.entityId === requisition.id ||
        log.remarks?.includes(requisition.requestId),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  for (const log of relatedLogs) {
    const variant: HubRequisitionTimelineEntry["variant"] = log.action
      .toLowerCase()
      .includes("reject")
      ? "danger"
      : log.action.toLowerCase().includes("approv")
        ? "success"
        : "default";

    entries.push({
      id: log.id,
      title: log.action,
      description: log.remarks,
      actor: log.user,
      timestamp: log.timestamp,
      variant,
    });
  }

  if (requisition.approvedAt && requisition.status !== "PENDING") {
    const alreadyLogged = entries.some((entry) =>
      entry.title.toLowerCase().includes("approv"),
    );

    if (!alreadyLogged && requisition.status === "APPROVED") {
      entries.unshift({
        id: `${requisition.id}-approved`,
        title: "Requisition Approved",
        description: requisition.adminRemarks,
        actor: "Super Admin",
        timestamp: requisition.approvedAt,
        variant: "success",
      });
    }
  }

  if (requisition.status === "REJECTED" && requisition.rejectionReason) {
    const alreadyLogged = entries.some((entry) =>
      entry.title.toLowerCase().includes("reject"),
    );

    if (!alreadyLogged) {
      entries.unshift({
        id: `${requisition.id}-rejected`,
        title: "Requisition Rejected",
        description: requisition.rejectionReason,
        actor: "Super Admin",
        timestamp: requisition.createdAt,
        variant: "danger",
      });
    }
  }

  if (isCompletedStatus(requisition.status)) {
    entries.unshift({
      id: `${requisition.id}-completed`,
      title:
        requisition.status === "TRANSFERRED"
          ? "Transfer Generated"
          : "Requisition Completed",
      description: requisition.transferId
        ? `Transfer ${requisition.transferId} linked`
        : undefined,
      actor: "System",
      timestamp: requisition.approvedAt ?? requisition.createdAt,
      variant: "success",
    });
  }

  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getHubRequisitionDetailView(
  requisition: RequisitionListItem,
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  activityLogs: ErpActivityLog[],
): HubRequisitionDetailView {
  const detail = getRequisitionDetail(requisition);
  const hubMeta = resolveHubManager(
    subHubs,
    requisition.hubId,
    requisition.requestedBy.name,
  );
  const inventory = resolveHubInventoryContext(
    hubInventory,
    requisition.hubId,
    requisition.materialId,
  );
  const timeline = buildHubRequisitionTimeline(requisition, activityLogs);

  return {
    requisition: detail,
    hubManager: hubMeta.managerName,
    hubCity: hubMeta.city,
    hubRegion: hubMeta.region,
    inventory,
    timeline,
  };
}

export function formatHubRequisitionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatHubRequisitionPrintDate(isoDate: string): string {
  return `${formatRequisitionDateOnly(isoDate)} at ${formatRequisitionTimeOnly(isoDate)}`;
}
