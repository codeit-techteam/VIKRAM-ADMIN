import { ROUTES } from "@/constants/routes";
import { getAvailableStock, getSharedInventoryItem } from "@/mock/inventory";
import type { PaginationMeta } from "@/types/api";
import type {
  RequisitionAdvancedFilters,
  RequisitionApprovalPayload,
  RequisitionAttachment,
  RequisitionAuditEntry,
  RequisitionDetail,
  RequisitionFilterChip,
  RequisitionListItem,
  RequisitionPriority,
  RequisitionQueryParams,
  RequisitionRejectionPayload,
  RequisitionStats,
  RequisitionStatus,
} from "@/types/warehouse.types";

export const REQUISITION_PAGE_SIZE = 10;

export const REQUISITION_HUB_OPTIONS = [
  { id: "hub-gurgaon-north", label: "Gurgaon North" },
  { id: "hub-noida-62", label: "Noida Sector 62" },
  { id: "hub-manesar", label: "Manesar Plant" },
  { id: "hub-dwarka", label: "Dwarka Expressway Site" },
  { id: "hub-noida-north", label: "Noida North" },
  { id: "hub-gurgaon-west", label: "Gurgaon West" },
  { id: "hub-delhi-south", label: "Delhi South" },
  { id: "hub-faridabad-east", label: "Faridabad East" },
] as const;

export const REQUISITION_WAREHOUSE_OPTIONS = [
  { id: "wh-noida-central", label: "Noida Central Warehouse" },
  { id: "wh-gurgaon-hub", label: "Gurgaon Distribution Hub" },
  { id: "wh-delhi-south", label: "Delhi South Warehouse" },
] as const;

const HUB_REGIONS: Record<string, string> = {
  "hub-gurgaon-north": "NCR North",
  "hub-noida-62": "NCR East",
  "hub-manesar": "NCR West",
  "hub-dwarka": "NCR South-West",
  "hub-noida-north": "NCR North",
  "hub-gurgaon-west": "NCR West",
  "hub-delhi-south": "NCR South",
  "hub-faridabad-east": "NCR East",
};

const REQUEST_REASONS = [
  "Required for upcoming customer dispatch scheduled tomorrow.",
  "Critical stock replenishment needed for ongoing construction phase.",
  "Emergency request due to site material shortage before concrete pour.",
  "Scheduled hub transfer to meet weekly project milestone.",
  "Customer order fulfillment for premium residential project.",
  "Preventive restock ahead of monsoon construction slowdown.",
] as const;

// TODO: Replace with requisition audit log API
export const REQUISITION_AUDIT_LOG: RequisitionAuditEntry[] = [];

const REQUESTERS = [
  { name: "Amit Sharma", role: "Project Manager" },
  { name: "Sneha Reddy", role: "Site Supervisor" },
  { name: "Vijay Kumar", role: "Inventory Assistant" },
  { name: "Deepak Gupta", role: "Project Lead" },
  { name: "Priya Singh", role: "Site Engineer" },
  { name: "Rajesh Mehta", role: "Store Keeper" },
  { name: "Anita Desai", role: "Project Manager" },
  { name: "Rohit Verma", role: "Site Supervisor" },
] as const;

const MATERIAL_TEMPLATES = [
  {
    materialId: "inv-002",
    material: "UltraTech Cement",
    materialSpec: "OPC 53 Grade",
    unit: "Bags",
    qtyRange: [200, 800],
  },
  {
    materialId: "inv-005",
    material: "TMT Steel Rods",
    materialSpec: "12mm",
    unit: "Tons",
    qtyRange: [1, 5],
  },
  {
    materialId: "inv-007",
    material: "Industrial Paint",
    materialSpec: "White",
    unit: "Ltrs",
    qtyRange: [100, 500],
  },
  {
    materialId: "inv-004",
    material: "PPC Bricks",
    materialSpec: "Standard",
    unit: "Units",
    qtyRange: [5000, 15000],
  },
  {
    materialId: "inv-001",
    material: "Steel Rebar FE 500D",
    materialSpec: "12mm",
    unit: "kg",
    qtyRange: [5000, 25000],
  },
  {
    materialId: "inv-006",
    material: "PPC Cement",
    materialSpec: "43 Grade",
    unit: "Bags",
    qtyRange: [150, 600],
  },
  {
    materialId: "inv-008",
    material: "River Sand",
    materialSpec: "Fine Grade",
    unit: "Units",
    qtyRange: [20, 80],
  },
  {
    materialId: "inv-009",
    material: "White Cement",
    materialSpec: "Premium",
    unit: "Bags",
    qtyRange: [50, 300],
  },
] as const;

function createDate(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isWithinLast7Days(date: Date, reference: Date): boolean {
  const sevenDaysAgo = new Date(reference);
  sevenDaysAgo.setDate(reference.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  return date >= sevenDaysAgo && date <= reference;
}

function buildRequisition(
  index: number,
  overrides: Partial<RequisitionListItem> = {},
): RequisitionListItem {
  const id = `req-${8800 + index}`;
  const requestId = `#REQ-${8800 + index}`;
  const template = MATERIAL_TEMPLATES[index % MATERIAL_TEMPLATES.length];
  const hub = REQUISITION_HUB_OPTIONS[index % REQUISITION_HUB_OPTIONS.length];
  const warehouse =
    REQUISITION_WAREHOUSE_OPTIONS[index % REQUISITION_WAREHOUSE_OPTIONS.length];
  const requester = REQUESTERS[index % REQUESTERS.length];
  const [minQty, maxQty] = template.qtyRange;
  const requestedQty =
    minQty + Math.floor((index * 37) % (maxQty - minQty + 1) || 1);

  const priorities: RequisitionPriority[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const statuses: RequisitionStatus[] = ["PENDING", "APPROVED", "REJECTED"];

  const priority = priorities[index % priorities.length];
  const status = statuses[index % statuses.length];
  // APPROVED rows land on index % 3 === 1, so never use index % 3 === 0 here.
  const allocationStatus =
    status === "APPROVED"
      ? index % 2 === 1
        ? "PENDING"
        : "ALLOCATED"
      : "NOT_APPLICABLE";

  const dayOffset = index % 10;
  const hour = 8 + (index % 10);
  const minute = (index * 15) % 60;

  return {
    id,
    requestId,
    requestedBy: requester,
    hubName: hub.label,
    hubId: hub.id,
    warehouseId: warehouse.id,
    warehouseName: warehouse.label,
    materialId: template.materialId,
    material: template.material,
    materialSpec: template.materialSpec,
    requestedQty,
    unit: template.unit,
    priority,
    status,
    allocationStatus,
    createdAt: createDate(dayOffset, hour, minute),
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/${id}`,
    customerName: index % 3 === 0 ? "Bajriwala Homes Pvt. Ltd." : undefined,
    ...overrides,
  };
}

function buildAttachments(
  index: number,
  requestId: string,
): RequisitionAttachment[] {
  if (index % 4 === 3) {
    return [];
  }

  const baseUrl = `/mock/requisitions/${requestId.replace("#", "")}`;

  return [
    {
      id: `${requestId}-purchase-sheet`,
      name: "Purchase Sheet.pdf",
      type: "purchase-sheet",
      url: `${baseUrl}/purchase-sheet.pdf`,
      mimeType: "application/pdf",
    },
    ...(index % 2 === 0
      ? [
          {
            id: `${requestId}-quotation`,
            name: "Quotation.pdf",
            type: "quotation" as const,
            url: `${baseUrl}/quotation.pdf`,
            mimeType: "application/pdf",
          },
        ]
      : []),
    ...(index % 3 === 0
      ? [
          {
            id: `${requestId}-supporting`,
            name: "Supporting Document.pdf",
            type: "supporting-document" as const,
            url: `${baseUrl}/supporting-document.pdf`,
            mimeType: "application/pdf",
          },
        ]
      : []),
  ];
}

export function getRequisitionDetail(
  item: RequisitionListItem,
): RequisitionDetail {
  const inventory = getSharedInventoryItem(item.materialId);
  const index = Number.parseInt(item.id.replace("req-", ""), 10) || 0;

  return {
    ...item,
    region: HUB_REGIONS[item.hubId] ?? "NCR",
    destinationWarehouse: item.warehouseName,
    assignedWarehouse: item.warehouseName,
    sku: inventory?.sku ?? "N/A",
    category: inventory?.category ?? "General Materials",
    requestReason: REQUEST_REASONS[index % REQUEST_REASONS.length],
    attachments: buildAttachments(index, item.requestId),
    adminRemarks: item.adminRemarks,
    rejectionReason: item.rejectionReason,
  };
}

export function formatRequisitionDateOnly(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRequisitionTimeOnly(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function createAuditEntry(
  requisitionId: string,
  adminName: string,
  action: RequisitionAuditEntry["action"],
  remarks?: string,
): RequisitionAuditEntry {
  const now = new Date();

  return {
    id: `audit-${requisitionId}-${now.getTime()}`,
    requisitionId,
    adminName,
    action,
    date: now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    remarks,
  };
}

// TODO: Replace with requisition approval API
export function approveRequisition(
  items: RequisitionListItem[],
  requisitionId: string,
  payload: RequisitionApprovalPayload,
): {
  items: RequisitionListItem[];
  auditEntry: RequisitionAuditEntry;
} {
  const auditEntry = createAuditEntry(
    requisitionId,
    payload.adminName,
    "APPROVE",
    payload.remarks,
  );
  REQUISITION_AUDIT_LOG.unshift(auditEntry);

  const updatedItems = items.map((item) => {
    if (item.id !== requisitionId) {
      return item;
    }

    return {
      ...item,
      status: "APPROVED" as RequisitionStatus,
      allocationStatus: "PENDING" as const,
      adminRemarks: payload.remarks?.trim() || item.adminRemarks,
    };
  });

  return { items: updatedItems, auditEntry };
}

// TODO: Replace with requisition rejection API
export function rejectRequisition(
  items: RequisitionListItem[],
  requisitionId: string,
  payload: RequisitionRejectionPayload,
): {
  items: RequisitionListItem[];
  auditEntry: RequisitionAuditEntry;
} {
  const auditEntry = createAuditEntry(
    requisitionId,
    payload.adminName,
    "REJECT",
    payload.remarks,
  );
  REQUISITION_AUDIT_LOG.unshift(auditEntry);

  const updatedItems = items.map((item) => {
    if (item.id !== requisitionId) {
      return item;
    }

    return {
      ...item,
      status: "REJECTED" as RequisitionStatus,
      allocationStatus: "NOT_APPLICABLE" as const,
      adminRemarks: payload.remarks,
      rejectionReason: payload.remarks,
    };
  });

  return { items: updatedItems, auditEntry };
}

export function getRequisitionAuditLog(
  requisitionId: string,
): RequisitionAuditEntry[] {
  return REQUISITION_AUDIT_LOG.filter(
    (entry) => entry.requisitionId === requisitionId,
  );
}

// TODO: Replace with requisition list API
export const REQUISITION_LIST: RequisitionListItem[] = [
  buildRequisition(21, {
    requestId: "#REQ-8821",
    id: "req-8821",
    requestedBy: { name: "Amit Sharma", role: "Project Manager" },
    hubName: "Gurgaon North",
    hubId: "hub-gurgaon-north",
    material: "UltraTech Cement",
    materialSpec: "OPC 53 Grade",
    materialId: "inv-002",
    requestedQty: 500,
    unit: "Bags",
    priority: "critical",
    status: "PENDING",
    allocationStatus: "NOT_APPLICABLE",
    createdAt: createDate(0, 9, 15),
  }),
  buildRequisition(19, {
    requestId: "#REQ-8819",
    id: "req-8819",
    requestedBy: { name: "Sneha Reddy", role: "Site Supervisor" },
    hubName: "Noida Sector 62",
    hubId: "hub-noida-62",
    material: "TMT Steel Rods",
    materialSpec: "12mm",
    materialId: "inv-005",
    requestedQty: 2.5,
    unit: "Tons",
    priority: "high",
    status: "PENDING",
    allocationStatus: "NOT_APPLICABLE",
    createdAt: createDate(0, 8, 30),
  }),
  buildRequisition(15, {
    requestId: "#REQ-8815",
    id: "req-8815",
    requestedBy: { name: "Vijay Kumar", role: "Inventory Assistant" },
    hubName: "Manesar Plant",
    hubId: "hub-manesar",
    material: "Industrial Paint",
    materialSpec: "White",
    materialId: "inv-007",
    requestedQty: 200,
    unit: "Ltrs",
    priority: "medium",
    status: "PENDING",
    allocationStatus: "NOT_APPLICABLE",
    createdAt: createDate(1, 16, 45),
  }),
  buildRequisition(12, {
    requestId: "#REQ-8812",
    id: "req-8812",
    requestedBy: { name: "Deepak Gupta", role: "Project Lead" },
    hubName: "Dwarka Expressway Site",
    hubId: "hub-dwarka",
    material: "PPC Bricks",
    materialSpec: "Standard",
    materialId: "inv-004",
    requestedQty: 10000,
    unit: "Units",
    priority: "critical",
    status: "PENDING",
    allocationStatus: "NOT_APPLICABLE",
    createdAt: createDate(1, 14, 20),
  }),
  ...Array.from({ length: 38 }, (_, index) => buildRequisition(index + 23)),
  buildRequisition(8, {
    requestId: "#REQ-8808",
    id: "req-8808",
    hubName: "Gurgaon North",
    hubId: "hub-gurgaon-north",
    material: "Steel Rebar FE 500D",
    materialId: "inv-001",
    requestedQty: 12000,
    unit: "kg",
    priority: "high",
    status: "TRANSFERRED",
    allocationStatus: "ALLOCATED",
    approvedQty: 12000,
    transferId: "TRN-2040",
    createdAt: createDate(5, 11, 0),
    approvedAt: createDate(4, 15, 30),
  }),
  buildRequisition(6, {
    requestId: "#REQ-8806",
    id: "req-8806",
    hubName: "Noida Sector 62",
    hubId: "hub-noida-62",
    material: "PPC Cement",
    materialId: "inv-006",
    requestedQty: 400,
    unit: "Bags",
    priority: "medium",
    status: "COMPLETED",
    allocationStatus: "ALLOCATED",
    approvedQty: 400,
    transferId: "TRN-2038",
    createdAt: createDate(8, 10, 15),
    approvedAt: createDate(7, 16, 45),
  }),
];

export const EMPTY_REQUISITION_ADVANCED_FILTERS: RequisitionAdvancedFilters = {
  priority: "all",
  status: "all",
  hubId: "all",
  warehouseId: "all",
  material: "",
  requestedBy: "",
  dateFrom: "",
  dateTo: "",
};

export function getMaterialAvailableStock(materialId: string): {
  available: number;
  unit: string;
} | null {
  const item = getSharedInventoryItem(materialId);

  if (!item) {
    return null;
  }

  return {
    available: getAvailableStock(item),
    unit: item.unit,
  };
}

export function formatRequisitionQuantity(qty: number, unit: string): string {
  const formatted =
    qty % 1 === 0
      ? qty.toLocaleString("en-IN")
      : qty.toLocaleString("en-IN", { maximumFractionDigits: 1 });

  return `${formatted} ${unit}`;
}

export function formatRequisitionDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function matchesChip(
  item: RequisitionListItem,
  chip: RequisitionFilterChip,
  referenceDate: Date,
): boolean {
  const createdAt = new Date(item.createdAt);

  switch (chip) {
    case "all":
      return true;
    case "critical":
      return item.priority === "critical";
    case "pending":
      return item.status === "PENDING";
    case "approved":
      return item.status === "APPROVED";
    case "rejected":
      return item.status === "REJECTED";
    case "today":
      return isSameDay(createdAt, referenceDate);
    case "last-7-days":
      return isWithinLast7Days(createdAt, referenceDate);
    default:
      return true;
  }
}

function matchesAdvanced(
  item: RequisitionListItem,
  filters: Partial<RequisitionAdvancedFilters>,
): boolean {
  if (filters.priority && filters.priority !== "all") {
    if (item.priority !== filters.priority) return false;
  }

  if (filters.status && filters.status !== "all") {
    if (item.status !== filters.status) return false;
  }

  if (filters.hubId && filters.hubId !== "all") {
    if (item.hubId !== filters.hubId) return false;
  }

  if (filters.warehouseId && filters.warehouseId !== "all") {
    if (item.warehouseId !== filters.warehouseId) return false;
  }

  if (filters.material?.trim()) {
    const query = filters.material.trim().toLowerCase();
    const haystack =
      `${item.material} ${item.materialSpec ?? ""}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.requestedBy?.trim()) {
    const query = filters.requestedBy.trim().toLowerCase();
    const haystack =
      `${item.requestedBy.name} ${item.requestedBy.role}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    if (new Date(item.createdAt) < from) return false;
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    if (new Date(item.createdAt) > to) return false;
  }

  return true;
}

function matchesSearch(item: RequisitionListItem, search?: string): boolean {
  if (!search?.trim()) return true;

  const query = search.trim().toLowerCase();
  const haystack = [
    item.requestId,
    item.requestedBy.name,
    item.requestedBy.role,
    item.hubName,
    item.material,
    item.materialSpec,
    item.warehouseName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function computeRequisitionStats(
  items: RequisitionListItem[],
  referenceDate: Date = new Date(),
): RequisitionStats {
  return {
    pendingRequests: items.filter((item) => item.status === "PENDING").length,
    criticalRequests: items.filter(
      (item) => item.status === "PENDING" && item.priority === "critical",
    ).length,
    awaitingAllocation: items.filter(
      (item) =>
        item.status === "APPROVED" && item.allocationStatus === "PENDING",
    ).length,
    todaysRequests: items.filter((item) =>
      isSameDay(new Date(item.createdAt), referenceDate),
    ).length,
  };
}

export function filterRequisitions(
  items: RequisitionListItem[],
  params: RequisitionQueryParams,
  referenceDate: Date = new Date(),
): RequisitionListItem[] {
  const chip = params.chip ?? "all";

  return items
    .filter((item) => matchesChip(item, chip, referenceDate))
    .filter((item) => matchesAdvanced(item, params.advanced ?? {}))
    .filter((item) => matchesSearch(item, params.search))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function paginateRequisitions(
  items: RequisitionListItem[],
  page: number,
  limit: number,
): { data: RequisitionListItem[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

// TODO: Replace with requisition list API
export function fetchRequisitions(
  items: RequisitionListItem[],
  params: RequisitionQueryParams = {},
): {
  data: RequisitionListItem[];
  meta: PaginationMeta;
  stats: RequisitionStats;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? REQUISITION_PAGE_SIZE;
  const filtered = filterRequisitions(items, params);
  const paginated = paginateRequisitions(filtered, page, limit);

  return {
    ...paginated,
    stats: computeRequisitionStats(items),
  };
}
