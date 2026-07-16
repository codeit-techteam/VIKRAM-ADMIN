import type {
  ManagerActivityEvent,
  ManagerDashboardStats,
  ManagerDispatchRow,
  ManagerDriverRow,
  ManagerFilters,
  ManagerProfileDetail,
  ManagerQueryParams,
  ManagerQueryResult,
  ManagerRequisitionRow,
  ManagerStatus,
  SubHubManager,
  HubSummary,
} from "@/features/user-management/types/sub-hub-manager.types";
import { SUB_HUBS } from "@/mock/sub-hubs";
import { managerNeedsAttention } from "@/utils/manager-ops-metrics";

// ─── Reference data (aligned with Sub-Hub Network) ────────────────────────────

function warehouseForCity(city: string): string {
  if (city === "Gurgaon" || city === "Manesar")
    return "Gurgaon Central Warehouse";
  if (city === "Noida" || city === "Faridabad") return "NCR Regional Warehouse";
  if (city === "New Delhi") return "Delhi Central Warehouse";
  if (city === "Jaipur") return "Rajasthan Regional Warehouse";
  return `${city} Regional Warehouse`;
}

/** Hub catalog shared by list, transfer, and profile — IDs match SUB_HUBS. */
export const MANAGER_HUBS: HubSummary[] = SUB_HUBS.filter(
  (hub) => hub.isActive,
).map((hub) => ({
  hubId: hub.id,
  hubName: hub.name,
  hubCode: hub.nodeId,
  city: hub.city,
  warehouse: warehouseForCity(hub.city),
  coverageRadius: "12 km",
  pendingRequisitions: 0,
  pendingDispatches: 0,
  todayOrders: 0,
  lowStockItems: 0,
  drivers: 12,
}));

const REGIONS: Record<string, string> = Object.fromEntries(
  SUB_HUBS.map((hub) => [hub.id, hub.region]),
);

const WAREHOUSES = [...new Set(MANAGER_HUBS.map((hub) => hub.warehouse))];

const FIRST_NAMES = [
  "Arjun",
  "Priya",
  "Rahul",
  "Kavita",
  "Suresh",
  "Deepa",
  "Vikram",
  "Meera",
  "Amit",
  "Neha",
  "Rohan",
  "Anjali",
  "Karan",
  "Divya",
  "Sanjay",
  "Pooja",
  "Pritam",
  "Sneha",
  "Rajesh",
  "Ananya",
  "Mahesh",
  "Rekha",
  "Vinod",
  "Sunita",
];

const LAST_NAMES = [
  "Sharma",
  "Kumar",
  "Patil",
  "Singh",
  "Kapoor",
  "Mehta",
  "Nair",
  "Deshmukh",
  "Gupta",
  "Reddy",
  "Joshi",
  "Verma",
  "Iyer",
  "Malhotra",
  "Chopra",
  "Bose",
  "Rao",
  "Pillai",
  "Saxena",
  "Tyagi",
  "Pandey",
  "Shukla",
  "Mishra",
  "Tiwari",
];

// ─── Deterministic helpers ─────────────────────────────────────────────────────

function hashString(value: string): number {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function computeStatus(manager: {
  pendingRequisitions: number;
  pendingDispatches: number;
  lowStockItems: number;
  todayOrders: number;
  isOnLeave: boolean;
}): ManagerStatus {
  if (manager.isOnLeave) return "LEAVE";
  if (manager.pendingDispatches > 15 || manager.todayOrders > 40) return "BUSY";
  if (manager.pendingRequisitions > 5 || manager.lowStockItems > 10)
    return "ATTENTION";
  return "ACTIVE";
}

// ─── Core managers (1:1 with Sub-Hub Network assigned managers) ───────────────

function buildCoreManagerFromHub(
  hub: (typeof SUB_HUBS)[number],
  index: number,
  overrides?: Partial<SubHubManager>,
): SubHubManager {
  const hash = hashString(hub.id);
  const pendingRequisitions = 2 + (hash % 8);
  const pendingDispatches = 4 + (hash % 18);
  const todayOrders = 12 + (hash % 40);
  const lowStockItems = hash % 14;
  const totalDrivers = 10 + (hash % 12);
  const availableDrivers = Math.min(
    totalDrivers,
    Math.floor(totalDrivers * 0.65) + (hash % 3),
  );
  const isOnLeave = !hub.isActive || overrides?.status === "LEAVE";

  const base: SubHubManager = {
    id: `mgr-${String(index + 1).padStart(3, "0")}`,
    employeeId: `BQ-MGR-${String(index + 1).padStart(3, "0")}`,
    name: hub.managerName,
    phone: hub.managerPhone ?? `+91 98100 ${11000 + index}`,
    email:
      hub.managerEmail ??
      `${hub.managerName.toLowerCase().replace(/\s+/g, ".")}@bajriwala.in`,
    hubId: hub.id,
    hubName: hub.name,
    hubCode: hub.nodeId,
    warehouse: warehouseForCity(hub.city),
    region: hub.region,
    city: hub.city,
    pendingRequisitions,
    pendingDispatches,
    todayOrders,
    lowStockItems,
    availableDrivers,
    totalDrivers,
    joiningDate: hub.hubSince ?? daysAgoIso(365),
    status: computeStatus({
      pendingRequisitions,
      pendingDispatches,
      lowStockItems,
      todayOrders,
      isOnLeave,
    }),
  };

  return { ...base, ...overrides, status: overrides?.status ?? base.status };
}

const CORE_MANAGERS: SubHubManager[] = SUB_HUBS.map((hub, index) =>
  buildCoreManagerFromHub(
    hub,
    index,
    !hub.isActive ? { status: "LEAVE" } : undefined,
  ),
);

// ─── Generated relief / secondary managers ─────────────────────────────────────

const TOTAL_MANAGERS = 24;

function buildGeneratedManager(index: number): SubHubManager {
  const activeHubs =
    MANAGER_HUBS.length > 0
      ? MANAGER_HUBS
      : [
          {
            hubId: "hub-gurgaon-north",
            hubName: "Gurgaon Central",
            hubCode: "H-101",
            city: "Gurgaon",
            warehouse: warehouseForCity("Gurgaon"),
            coverageRadius: "12 km",
            pendingRequisitions: 0,
            pendingDispatches: 0,
            todayOrders: 0,
            lowStockItems: 0,
            drivers: 12,
          },
        ];
  const hub = activeHubs[index % activeHubs.length];
  const firstName = FIRST_NAMES[(index * 7) % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const id = `mgr-gen-${String(index + 1).padStart(3, "0")}`;
  const hash = hashString(id);

  const pendingRequisitions = hash % 12;
  const pendingDispatches = 4 + (hash % 22);
  const todayOrders = 10 + (hash % 50);
  const lowStockItems = hash % 16;
  const totalDrivers = 8 + (hash % 16);
  const availableDrivers = Math.floor(totalDrivers * 0.6) + (hash % 4);
  const isOnLeave = hash % 9 === 0;

  const status = computeStatus({
    pendingRequisitions,
    pendingDispatches,
    lowStockItems,
    todayOrders,
    isOnLeave,
  });

  return {
    id,
    employeeId: `BQ-MGR-${String(index + CORE_MANAGERS.length + 1).padStart(3, "0")}`,
    name: `${firstName} ${lastName}`,
    phone: `+91 98${String(10000000 + hash).slice(0, 8)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bajriwala.in`,
    hubId: hub.hubId,
    hubName: hub.hubName,
    hubCode: hub.hubCode,
    warehouse: hub.warehouse,
    region: REGIONS[hub.hubId] ?? "NCR North",
    city: hub.city,
    status,
    pendingRequisitions,
    pendingDispatches,
    todayOrders,
    lowStockItems,
    availableDrivers: Math.min(availableDrivers, totalDrivers),
    totalDrivers,
    joiningDate: daysAgoIso(60 + (hash % 600)),
  };
}

// ─── All managers (memoised) ───────────────────────────────────────────────────

let _allManagers: SubHubManager[] | null = null;

export function getAllManagers(): SubHubManager[] {
  if (_allManagers) return _allManagers;

  const generated = Array.from(
    { length: TOTAL_MANAGERS - CORE_MANAGERS.length },
    (_, index) => buildGeneratedManager(index),
  );

  _allManagers = [...CORE_MANAGERS, ...generated];
  return _allManagers;
}

// ─── Filter logic ──────────────────────────────────────────────────────────────

function matchesFilters(
  manager: SubHubManager,
  filters: ManagerFilters,
): boolean {
  if (filters.region !== "all" && manager.region !== filters.region) {
    return false;
  }
  if (filters.hubId !== "all" && manager.hubId !== filters.hubId) {
    return false;
  }
  if (filters.status !== "all") {
    if (filters.status === "NEED_ATTENTION") {
      if (!managerNeedsAttention(manager)) return false;
    } else if (manager.status !== filters.status) {
      return false;
    }
  }
  if (filters.warehouse !== "all" && manager.warehouse !== filters.warehouse) {
    return false;
  }
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const match =
      manager.name.toLowerCase().includes(q) ||
      manager.employeeId.toLowerCase().includes(q) ||
      manager.hubName.toLowerCase().includes(q) ||
      manager.phone.includes(q) ||
      manager.email.toLowerCase().includes(q);
    if (!match) return false;
  }
  return true;
}

// ─── Dashboard stats ───────────────────────────────────────────────────────────

export function computeManagerStats(
  managers: SubHubManager[],
): ManagerDashboardStats {
  return {
    totalManagers: managers.length,
    managersAvailable: managers.filter((m) => m.status === "ACTIVE").length,
    managersNeedAttention: managers.filter((m) => managerNeedsAttention(m))
      .length,
    managersOnLeave: managers.filter((m) => m.status === "LEAVE").length,
  };
}

// ─── Query (paginated + filtered) ────────────────────────────────────────────

export function queryManagers(
  managers: SubHubManager[],
  params: ManagerQueryParams,
): ManagerQueryResult {
  const filtered = managers
    .filter((m) => matchesFilters(m, params.filters))
    .sort((a, b) => a.name.localeCompare(b.name));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * params.limit;

  return {
    data: filtered.slice(start, start + params.limit),
    meta: { total, page, limit: params.limit, totalPages },
    stats: computeManagerStats(managers),
  };
}

// ─── Profile detail ────────────────────────────────────────────────────────────

const ACTIVITY_TEMPLATES = [
  {
    title: "Approved Requisition",
    description: "Approved pending material requisition",
  },
  {
    title: "Received Warehouse Transfer",
    description: "Acknowledged inbound stock transfer",
  },
  {
    title: "Assigned Driver",
    description: "Allocated driver to outbound dispatch",
  },
  { title: "Created Dispatch", description: "Initiated new dispatch order" },
  { title: "Dispatch Completed", description: "Confirmed delivery completion" },
  {
    title: "Low Stock Alert",
    description: "Flagged inventory below reorder level",
  },
  { title: "Driver Check-In", description: "Confirmed driver availability" },
  { title: "Inventory Update", description: "Updated stock count after audit" },
];

const MATERIALS = [
  "TMT Steel Bars",
  "Cement Bags",
  "Sand (Bulk)",
  "Aggregates",
  "Bricks",
  "Roof Sheets",
  "PVC Pipes",
  "Steel Mesh",
  "Tiles",
  "Waterproofing Sheets",
];

const VEHICLES = [
  "MH-02-AB-1234",
  "DL-01-CD-5678",
  "KA-03-EF-9012",
  "TN-04-GH-3456",
];
const DRIVER_NAMES = [
  "Ramesh Yadav",
  "Sunil Patil",
  "Anil Kumar",
  "Ganesh More",
  "Raju Thakur",
  "Sanjay Bhosle",
  "Dinesh Chauhan",
  "Prakash Nair",
];

function buildHours(): string[] {
  return [
    "09:20 AM",
    "10:05 AM",
    "10:45 AM",
    "11:30 AM",
    "12:15 PM",
    "02:00 PM",
    "03:30 PM",
    "04:45 PM",
  ];
}

export function getManagerProfile(
  managerId: string,
  managers: SubHubManager[],
): ManagerProfileDetail | null {
  const manager = managers.find((m) => m.id === managerId);
  if (!manager) return null;

  const hash = hashString(managerId);
  const networkHub = SUB_HUBS.find((h) => h.id === manager.hubId);
  const hub: HubSummary =
    MANAGER_HUBS.find((h) => h.hubId === manager.hubId) ??
    (networkHub
      ? {
          hubId: networkHub.id,
          hubName: networkHub.name,
          hubCode: networkHub.nodeId,
          city: networkHub.city,
          warehouse: warehouseForCity(networkHub.city),
          coverageRadius: "12 km",
          pendingRequisitions: manager.pendingRequisitions,
          pendingDispatches: manager.pendingDispatches,
          todayOrders: manager.todayOrders,
          lowStockItems: manager.lowStockItems,
          drivers: manager.totalDrivers,
        }
      : {
          hubId: manager.hubId,
          hubName: manager.hubName,
          hubCode: manager.hubCode,
          city: manager.city,
          warehouse: manager.warehouse,
          coverageRadius: "12 km",
          pendingRequisitions: manager.pendingRequisitions,
          pendingDispatches: manager.pendingDispatches,
          todayOrders: manager.todayOrders,
          lowStockItems: manager.lowStockItems,
          drivers: manager.totalDrivers,
        });

  const hours = buildHours();
  const recentActivity: ManagerActivityEvent[] = ACTIVITY_TEMPLATES.slice(
    0,
    5,
  ).map((template, index) => ({
    id: `act-${managerId}-${index}`,
    time: hours[index] ?? "09:00 AM",
    title: template.title,
    description: template.description,
  }));

  const pendingRequisitionRows: ManagerRequisitionRow[] = Array.from(
    { length: manager.pendingRequisitions },
    (_, index) => ({
      id: `req-${managerId}-${index}`,
      reqId: `REQ-${String(hash + index).slice(-4)}`,
      material: MATERIALS[(hash + index) % MATERIALS.length],
      requestedQty: 5 + ((hash + index) % 50),
      priority: (["HIGH", "MEDIUM", "LOW"] as const)[(hash + index) % 3],
      status: "PENDING" as const,
    }),
  );

  const pendingDispatchRows: ManagerDispatchRow[] = Array.from(
    { length: Math.min(manager.pendingDispatches, 5) },
    (_, index) => ({
      id: `disp-${managerId}-${index}`,
      dispatchId: `DSP-${String(hash + index).slice(-4)}`,
      customer: `Customer ${String(hash + index).slice(-3)}`,
      vehicle: VEHICLES[(hash + index) % VEHICLES.length],
      driver: DRIVER_NAMES[(hash + index) % DRIVER_NAMES.length],
      status: (["READY", "LOADING", "PENDING"] as const)[(hash + index) % 3],
    }),
  );

  const driverStatuses = ["AVAILABLE", "ON_ROUTE", "LOADING", "LEAVE"] as const;
  const driverRows: ManagerDriverRow[] = Array.from(
    { length: manager.totalDrivers },
    (_, index) => ({
      id: `drv-${managerId}-${index}`,
      driverName: DRIVER_NAMES[(hash + index) % DRIVER_NAMES.length],
      vehicle: VEHICLES[(hash + index) % VEHICLES.length],
      currentStatus: driverStatuses[(hash + index) % driverStatuses.length],
      todayTrips: (hash + index) % 8,
    }),
  );

  return {
    ...manager,
    hub,
    recentActivity,
    pendingRequisitionRows,
    pendingDispatchRows,
    driverRows,
  };
}

// ─── Filter options ────────────────────────────────────────────────────────────

export function getManagerFilterOptions() {
  const regions = [
    ...new Set(MANAGER_HUBS.map((h) => REGIONS[h.hubId] ?? h.city)),
  ];
  return {
    regions: regions.map((r) => ({ value: r, label: r })),
    hubs: MANAGER_HUBS.map((h) => ({ value: h.hubId, label: h.hubName })),
    statuses: [
      { value: "ACTIVE", label: "Active" },
      { value: "BUSY", label: "Busy" },
      { value: "ATTENTION", label: "Attention" },
      { value: "NEED_ATTENTION", label: "Need Attention" },
      { value: "LEAVE", label: "Leave" },
    ],
    warehouses: WAREHOUSES.map((w) => ({ value: w, label: w })),
  };
}
