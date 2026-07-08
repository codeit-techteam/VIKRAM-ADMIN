import type { PaginationMeta } from "@/types/api";
import type {
  DispatchStats,
  TransferFilters,
  TransferListItem,
  TransferQueryParams,
  TransferStats,
  TransferStatus,
} from "@/types/warehouse.types";

export const TRANSFER_PAGE_SIZE = 8;

export const TRANSFER_WAREHOUSE_OPTIONS = [
  { id: "wh-gurgaon-sector-44", label: "Gurgaon Sector 44" },
  { id: "wh-noida-central", label: "Noida Central Warehouse" },
  { id: "wh-manesar", label: "Manesar Plant Warehouse" },
  { id: "wh-delhi-south", label: "Delhi South Warehouse" },
] as const;

export const TRANSFER_HUB_OPTIONS = [
  { id: "hub-sohna-road", label: "Sohna Road Site" },
  { id: "hub-gurgaon-north", label: "Gurgaon North Hub" },
  { id: "hub-noida-62", label: "Noida Sector 62" },
  { id: "hub-dwarka", label: "Dwarka Expressway Site" },
  { id: "hub-faridabad-east", label: "Faridabad East Hub" },
  { id: "hub-manesar-site", label: "Manesar Site Hub" },
] as const;

export const EMPTY_TRANSFER_FILTERS: TransferFilters = {
  status: "all",
  sourceWarehouseId: "all",
  destinationHubId: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
};

const DRIVERS = [
  { name: "Amit Singh", employeeId: "DRV-1042" },
  { name: "Rajesh Kumar", employeeId: "DRV-0891" },
  { name: "Vikram Sharma", employeeId: "DRV-1156" },
  { name: "Suresh Patel", employeeId: "DRV-0773" },
  { name: "Deepak Gupta", employeeId: "DRV-1204" },
  { name: "Rohan Mehta", employeeId: "DRV-0938" },
] as const;

const VEHICLES = [
  "HR-55-AN-1024",
  "DL-01-AB-4421",
  "HR-26-BK-7783",
  "UP-16-CD-3309",
  "HR-12-EF-5512",
  "DL-09-GH-2290",
] as const;

const MATERIAL_SETS = [
  ["TMT Steel (JSW) x20", "UltraTech Cement x150"],
  ["PPC Bricks x5000", "River Sand x40 Units"],
  ["TMT Steel Rods (12mm) x450 Bundles"],
  ["Industrial Paint x200 Ltrs", "White Cement x80 Bags"],
  ["Steel Rebar FE 500D x12 Tons"],
  ["PPC Cement x300 Bags", "TMT Steel (JSW) x15"],
] as const;

function createDate(daysOffset: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function buildTransfer(
  index: number,
  config: {
    status: TransferStatus;
    daysAgo: number;
    etaOffsetHours: number;
    warehouseIdx: number;
    hubIdx: number;
    hasVehicle: boolean;
    hasDriver: boolean;
    dispatched?: boolean;
    delivered?: boolean;
    completed?: boolean;
    transferType?: TransferListItem["transferType"];
    allocationId?: string;
    requisitionId?: string;
  },
): TransferListItem {
  const {
    status,
    daysAgo,
    etaOffsetHours,
    warehouseIdx,
    hubIdx,
    hasVehicle,
    hasDriver,
    dispatched,
    delivered,
    completed,
    transferType = "standard",
    allocationId,
    requisitionId,
  } = config;

  const warehouse =
    TRANSFER_WAREHOUSE_OPTIONS[
      warehouseIdx % TRANSFER_WAREHOUSE_OPTIONS.length
    ];
  const hub = TRANSFER_HUB_OPTIONS[hubIdx % TRANSFER_HUB_OPTIONS.length];
  const createdAt = createDate(-daysAgo, 8 + (index % 6), (index * 11) % 60);
  const createdDate = new Date(createdAt);
  const eta = new Date(createdDate);
  eta.setHours(eta.getHours() + etaOffsetHours);

  const driver = hasDriver ? DRIVERS[index % DRIVERS.length] : undefined;
  const vehicleNumber = hasVehicle
    ? VEHICLES[index % VEHICLES.length]
    : undefined;
  const materialLine = MATERIAL_SETS[index % MATERIAL_SETS.length][0];
  const materialName = materialLine.split(" x")[0];

  let dispatchAt: string | undefined;
  let deliveredAt: string | undefined;
  let hubReceivedAt: string | undefined;
  let completedAt: string | undefined;

  if (dispatched || status === "IN_TRANSIT" || status === "DELIVERED") {
    const dispatch = new Date(createdAt);
    dispatch.setHours(dispatch.getHours() + 2);
    dispatchAt = dispatch.toISOString();
  }

  if (delivered || status === "DELIVERED") {
    const delivered = new Date();
    if (daysAgo > 0) {
      delivered.setDate(delivered.getDate() - daysAgo);
    }
    delivered.setHours(10 + (index % 5), (index * 7) % 60, 0, 0);
    deliveredAt = delivered.toISOString();
  }

  if (completed || status === "DELIVERED") {
    hubReceivedAt = deliveredAt ?? new Date().toISOString();
    completedAt = hubReceivedAt;
  }

  const transferId = `TRN-${10240 - index}`;

  return {
    id: `transfer-${index + 1}`,
    transferId,
    allocationId: allocationId ?? `ALC-${9800 + index}`,
    requisitionId: requisitionId ?? `REQ-${8700 + index}`,
    sourceWarehouseId: warehouse.id,
    sourceWarehouse: warehouse.label,
    destinationHubId: hub.id,
    destinationHub: hub.label,
    vehicleNumber,
    vehicleId: hasVehicle ? `veh-mock-${index}` : undefined,
    driverId: hasDriver ? `drv-mock-${index}` : undefined,
    assignedDriver: driver,
    status,
    transferType,
    priority: transferType,
    material: materialName,
    sku: materialName.toLowerCase().includes("cement")
      ? "MT-00102"
      : "STL-TMT-12MM-001",
    quantity: 100 + index * 25,
    quantityUnit: materialLine.includes("Bags") ? "Bags" : "Units",
    createdAt,
    dispatchAt,
    eta: eta.toISOString(),
    deliveredAt,
    hubReceivedAt,
    completedAt,
    materials: [...MATERIAL_SETS[index % MATERIAL_SETS.length]],
    timeline: [],
    activityLogs: [],
    documents: [],
  };
}

export const TRANSFER_LIST: TransferListItem[] = [
  buildTransfer(42, {
    status: "DRAFT",
    daysAgo: 0,
    etaOffsetHours: 24,
    warehouseIdx: 0,
    hubIdx: 0,
    hasVehicle: false,
    hasDriver: false,
    allocationId: "ALC-DRAFT-01",
    requisitionId: "REQ-9401",
  }),
  buildTransfer(43, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 8,
    warehouseIdx: 0,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    transferType: "critical",
  }),
  buildTransfer(44, {
    status: "LOADING",
    daysAgo: 0,
    etaOffsetHours: 7,
    warehouseIdx: 1,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    transferType: "express",
  }),
  buildTransfer(45, {
    status: "READY_FOR_DISPATCH",
    daysAgo: 0,
    etaOffsetHours: 6,
    warehouseIdx: 2,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    transferType: "critical",
  }),
  buildTransfer(46, {
    status: "REACHED_HUB",
    daysAgo: 0,
    etaOffsetHours: 1,
    warehouseIdx: 0,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(0, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: 6,
    warehouseIdx: 0,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(1, {
    status: "IN_TRANSIT",
    daysAgo: 2,
    etaOffsetHours: -3,
    warehouseIdx: 1,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(2, {
    status: "DELIVERED",
    daysAgo: 0,
    etaOffsetHours: 4,
    warehouseIdx: 2,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    completed: true,
  }),
  buildTransfer(3, {
    status: "DELIVERED",
    daysAgo: 1,
    etaOffsetHours: 8,
    warehouseIdx: 0,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(4, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 12,
    warehouseIdx: 3,
    hubIdx: 4,
    hasVehicle: false,
    hasDriver: false,
  }),
  buildTransfer(5, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 10,
    warehouseIdx: 1,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: false,
  }),
  buildTransfer(6, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 9,
    warehouseIdx: 2,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(7, {
    status: "READY_FOR_DISPATCH",
    daysAgo: 0,
    etaOffsetHours: 8,
    warehouseIdx: 0,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(8, {
    status: "IN_TRANSIT",
    daysAgo: 0,
    etaOffsetHours: 7,
    warehouseIdx: 3,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(9, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: -5,
    warehouseIdx: 2,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(10, {
    status: "DELIVERED",
    daysAgo: 1,
    etaOffsetHours: 2,
    warehouseIdx: 1,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(11, {
    status: "DELIVERED",
    daysAgo: 3,
    etaOffsetHours: 6,
    warehouseIdx: 0,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(12, {
    status: "TRANSFER_CREATED",
    daysAgo: 1,
    etaOffsetHours: 14,
    warehouseIdx: 2,
    hubIdx: 0,
    hasVehicle: false,
    hasDriver: false,
  }),
  buildTransfer(13, {
    status: "TRANSFER_CREATED",
    daysAgo: 1,
    etaOffsetHours: 11,
    warehouseIdx: 3,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: false,
  }),
  buildTransfer(14, {
    status: "IN_TRANSIT",
    daysAgo: 2,
    etaOffsetHours: 5,
    warehouseIdx: 0,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(15, {
    status: "DELIVERED",
    daysAgo: 0,
    etaOffsetHours: 3,
    warehouseIdx: 1,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(16, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 10,
    warehouseIdx: 2,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(17, {
    status: "IN_TRANSIT",
    daysAgo: 3,
    etaOffsetHours: -8,
    warehouseIdx: 3,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(18, {
    status: "READY_FOR_DISPATCH",
    daysAgo: 0,
    etaOffsetHours: 6,
    warehouseIdx: 0,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(19, {
    status: "IN_TRANSIT",
    daysAgo: 0,
    etaOffsetHours: 5,
    warehouseIdx: 1,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(20, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: 4,
    warehouseIdx: 2,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(21, {
    status: "DELIVERED",
    daysAgo: 2,
    etaOffsetHours: 1,
    warehouseIdx: 3,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(22, {
    status: "DELIVERED",
    daysAgo: 5,
    etaOffsetHours: 7,
    warehouseIdx: 0,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(23, {
    status: "TRANSFER_CREATED",
    daysAgo: 2,
    etaOffsetHours: 16,
    warehouseIdx: 1,
    hubIdx: 0,
    hasVehicle: false,
    hasDriver: false,
  }),
  buildTransfer(24, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 9,
    warehouseIdx: 2,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: false,
  }),
  buildTransfer(25, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: -2,
    warehouseIdx: 3,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(26, {
    status: "DELIVERED",
    daysAgo: 0,
    etaOffsetHours: 2,
    warehouseIdx: 0,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(27, {
    status: "TRANSFER_CREATED",
    daysAgo: 1,
    etaOffsetHours: 12,
    warehouseIdx: 1,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(28, {
    status: "IN_TRANSIT",
    daysAgo: 2,
    etaOffsetHours: 3,
    warehouseIdx: 2,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(29, {
    status: "READY_FOR_DISPATCH",
    daysAgo: 0,
    etaOffsetHours: 7,
    warehouseIdx: 3,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(30, {
    status: "IN_TRANSIT",
    daysAgo: 0,
    etaOffsetHours: 6,
    warehouseIdx: 0,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(31, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: -4,
    warehouseIdx: 1,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(32, {
    status: "DELIVERED",
    daysAgo: 4,
    etaOffsetHours: 5,
    warehouseIdx: 2,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(33, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 15,
    warehouseIdx: 3,
    hubIdx: 3,
    hasVehicle: false,
    hasDriver: false,
  }),
  buildTransfer(34, {
    status: "TRANSFER_CREATED",
    daysAgo: 2,
    etaOffsetHours: 13,
    warehouseIdx: 0,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: false,
  }),
  buildTransfer(35, {
    status: "IN_TRANSIT",
    daysAgo: 1,
    etaOffsetHours: 8,
    warehouseIdx: 1,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(36, {
    status: "DELIVERED",
    daysAgo: 0,
    etaOffsetHours: 3,
    warehouseIdx: 2,
    hubIdx: 1,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(37, {
    status: "DELIVERED",
    daysAgo: 0,
    etaOffsetHours: 1,
    warehouseIdx: 3,
    hubIdx: 5,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
    delivered: true,
  }),
  buildTransfer(38, {
    status: "TRANSFER_CREATED",
    daysAgo: 0,
    etaOffsetHours: 11,
    warehouseIdx: 0,
    hubIdx: 4,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(39, {
    status: "IN_TRANSIT",
    daysAgo: 2,
    etaOffsetHours: -6,
    warehouseIdx: 1,
    hubIdx: 2,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
  buildTransfer(40, {
    status: "READY_FOR_DISPATCH",
    daysAgo: 1,
    etaOffsetHours: 9,
    warehouseIdx: 2,
    hubIdx: 3,
    hasVehicle: true,
    hasDriver: true,
  }),
  buildTransfer(41, {
    status: "IN_TRANSIT",
    daysAgo: 0,
    etaOffsetHours: 4,
    warehouseIdx: 3,
    hubIdx: 0,
    hasVehicle: true,
    hasDriver: true,
    dispatched: true,
  }),
];

export function isDispatchedToday(
  transfer: TransferListItem,
  reference = new Date(),
): boolean {
  if (!transfer.dispatchAt) return false;
  const dispatched = new Date(transfer.dispatchAt);
  return (
    dispatched.getFullYear() === reference.getFullYear() &&
    dispatched.getMonth() === reference.getMonth() &&
    dispatched.getDate() === reference.getDate()
  );
}

export function isTransferDelayed(
  transfer: TransferListItem,
  now = new Date(),
): boolean {
  if (transfer.isDelayed) return true;
  if (transfer.status === "DELIVERED" || transfer.status === "CANCELLED") {
    return false;
  }
  return new Date(transfer.eta) < now;
}

export function isDeliveredToday(
  transfer: TransferListItem,
  reference = new Date(),
): boolean {
  if (transfer.status !== "DELIVERED") return false;
  const deliveredAt = transfer.deliveredAt ?? transfer.hubReceivedAt;
  if (!deliveredAt) return false;
  const completed = new Date(deliveredAt);
  return (
    completed.getFullYear() === reference.getFullYear() &&
    completed.getMonth() === reference.getMonth() &&
    completed.getDate() === reference.getDate()
  );
}

export function computeTransferStats(
  transfers: TransferListItem[],
  reference = new Date(),
): TransferStats {
  return {
    pendingDispatch: transfers.filter((t) => t.status === "READY_FOR_DISPATCH")
      .length,
    loading: transfers.filter((t) => t.status === "LOADING").length,
    readyForDispatch: transfers.filter((t) => t.status === "READY_FOR_DISPATCH")
      .length,
    inTransit: transfers.filter((t) => t.status === "IN_TRANSIT").length,
    reachedHub: transfers.filter((t) => t.status === "REACHED_HUB").length,
    deliveredToday: transfers.filter((t) => isDeliveredToday(t, reference))
      .length,
    dispatchedToday: transfers.filter((t) => isDispatchedToday(t, reference))
      .length,
    delayedTransfers: transfers.filter((t) => isTransferDelayed(t, reference))
      .length,
  };
}

export function computeDispatchStats(
  transfers: TransferListItem[],
  reference = new Date(),
): DispatchStats {
  return {
    pendingDispatch: transfers.filter((t) => t.status === "TRANSFER_CREATED")
      .length,
    loading: transfers.filter((t) => t.status === "LOADING").length,
    readyForDispatch: transfers.filter((t) => t.status === "READY_FOR_DISPATCH")
      .length,
    dispatchedToday: transfers.filter(
      (t) => t.status === "IN_TRANSIT" && isDispatchedToday(t, reference),
    ).length,
  };
}

export function matchesSearch(
  transfer: TransferListItem,
  search: string,
): boolean {
  if (!search.trim()) return true;
  const query = search.trim().toLowerCase();
  const hubNames = [transfer.sourceWarehouse, transfer.destinationHub].map(
    (v) => v.toLowerCase(),
  );

  return (
    transfer.transferId.toLowerCase().includes(query) ||
    (transfer.allocationId?.toLowerCase().includes(query) ?? false) ||
    (transfer.vehicleNumber?.toLowerCase().includes(query) ?? false) ||
    (transfer.assignedDriver?.name.toLowerCase().includes(query) ?? false) ||
    hubNames.some((name) => name.includes(query))
  );
}

function applyTransferFilters(
  transfers: TransferListItem[],
  filters: TransferFilters,
): TransferListItem[] {
  return transfers.filter((transfer) => {
    if (filters.status === "delayed") {
      if (!isTransferDelayed(transfer)) return false;
    } else if (filters.status !== "all" && transfer.status !== filters.status) {
      return false;
    }

    if (
      filters.sourceWarehouseId !== "all" &&
      transfer.sourceWarehouseId !== filters.sourceWarehouseId
    ) {
      return false;
    }

    if (
      filters.destinationHubId !== "all" &&
      transfer.destinationHubId !== filters.destinationHubId
    ) {
      return false;
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(transfer.createdAt) < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(transfer.createdAt) > to) return false;
    }

    if (!matchesSearch(transfer, filters.search)) return false;

    return true;
  });
}

export function fetchTransfers(
  transfers: TransferListItem[],
  params: TransferQueryParams = {},
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? TRANSFER_PAGE_SIZE;
  const filters: TransferFilters = {
    ...EMPTY_TRANSFER_FILTERS,
    ...params.filters,
  };

  const filtered = applyTransferFilters(transfers, filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  const meta: PaginationMeta = {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };

  return {
    data,
    meta,
    stats: computeTransferStats(transfers),
  };
}

export function formatTransferDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTransferDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTransferTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getTransferEtaLabel(
  transfer: TransferListItem,
  now = new Date(),
): { label: string; tone: "success" | "warning" | "muted" } {
  if (transfer.status === "DELIVERED" || transfer.status === "CANCELLED") {
    return { label: "Finalized", tone: "muted" };
  }

  if (isTransferDelayed(transfer, now)) {
    const hoursLate = Math.max(
      1,
      Math.round(
        (now.getTime() - new Date(transfer.eta).getTime()) / 3_600_000,
      ),
    );
    return { label: `+${hoursLate}h Delay`, tone: "warning" };
  }

  return { label: "On Schedule", tone: "success" };
}
