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

// ─── Reference data ───────────────────────────────────────────────────────────

export const MANAGER_HUBS: HubSummary[] = [
  {
    hubId: "hub-mum-01",
    hubName: "Mumbai Central Hub",
    hubCode: "MUM-01",
    city: "Mumbai",
    warehouse: "Mumbai Central Warehouse",
    coverageRadius: "15 km",
    pendingRequisitions: 3,
    pendingDispatches: 8,
    todayOrders: 27,
    lowStockItems: 4,
    drivers: 22,
  },
  {
    hubId: "hub-pun-01",
    hubName: "Pune West Hub",
    hubCode: "PUN-01",
    city: "Pune",
    warehouse: "Pune Regional Warehouse",
    coverageRadius: "12 km",
    pendingRequisitions: 7,
    pendingDispatches: 16,
    todayOrders: 41,
    lowStockItems: 12,
    drivers: 18,
  },
  {
    hubId: "hub-del-01",
    hubName: "Delhi South Hub",
    hubCode: "DEL-01",
    city: "Delhi",
    warehouse: "Delhi Central Warehouse",
    coverageRadius: "18 km",
    pendingRequisitions: 2,
    pendingDispatches: 5,
    todayOrders: 19,
    lowStockItems: 3,
    drivers: 14,
  },
  {
    hubId: "hub-gur-01",
    hubName: "Gurgaon Central Hub",
    hubCode: "GUR-01",
    city: "Gurgaon",
    warehouse: "NCR Regional Warehouse",
    coverageRadius: "10 km",
    pendingRequisitions: 6,
    pendingDispatches: 20,
    todayOrders: 55,
    lowStockItems: 15,
    drivers: 20,
  },
  {
    hubId: "hub-nag-01",
    hubName: "Nagpur North Hub",
    hubCode: "NAG-01",
    city: "Nagpur",
    warehouse: "Nagpur Warehouse",
    coverageRadius: "20 km",
    pendingRequisitions: 4,
    pendingDispatches: 9,
    todayOrders: 22,
    lowStockItems: 6,
    drivers: 12,
  },
  {
    hubId: "hub-hyd-01",
    hubName: "Hyderabad East Hub",
    hubCode: "HYD-01",
    city: "Hyderabad",
    warehouse: "Hyderabad Warehouse",
    coverageRadius: "14 km",
    pendingRequisitions: 9,
    pendingDispatches: 18,
    todayOrders: 48,
    lowStockItems: 11,
    drivers: 16,
  },
  {
    hubId: "hub-che-01",
    hubName: "Chennai Central Hub",
    hubCode: "CHE-01",
    city: "Chennai",
    warehouse: "Chennai Warehouse",
    coverageRadius: "16 km",
    pendingRequisitions: 1,
    pendingDispatches: 4,
    todayOrders: 14,
    lowStockItems: 2,
    drivers: 10,
  },
  {
    hubId: "hub-ban-01",
    hubName: "Bangalore South Hub",
    hubCode: "BAN-01",
    city: "Bangalore",
    warehouse: "Bangalore Warehouse",
    coverageRadius: "11 km",
    pendingRequisitions: 5,
    pendingDispatches: 12,
    todayOrders: 33,
    lowStockItems: 8,
    drivers: 15,
  },
];

const REGIONS: Record<string, string> = {
  "hub-mum-01": "West Region",
  "hub-pun-01": "West Region",
  "hub-del-01": "North Region",
  "hub-gur-01": "North NCR",
  "hub-nag-01": "Central Region",
  "hub-hyd-01": "South Region",
  "hub-che-01": "South Region",
  "hub-ban-01": "South Region",
};

const WAREHOUSES = [
  "Mumbai Central Warehouse",
  "Pune Regional Warehouse",
  "Delhi Central Warehouse",
  "NCR Regional Warehouse",
  "Nagpur Warehouse",
  "Hyderabad Warehouse",
  "Chennai Warehouse",
  "Bangalore Warehouse",
];

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

// ─── Core 6 detailed managers ─────────────────────────────────────────────────

const CORE_MANAGERS: SubHubManager[] = [
  {
    id: "mgr-001",
    employeeId: "BQ-MGR-001",
    name: "Arjun Sharma",
    phone: "+91 98201 11001",
    email: "arjun.sharma@bqindia.com",
    hubId: "hub-mum-01",
    hubName: "Mumbai Central Hub",
    hubCode: "MUM-01",
    warehouse: "Mumbai Central Warehouse",
    region: "West Region",
    city: "Mumbai",
    pendingRequisitions: 3,
    pendingDispatches: 8,
    todayOrders: 27,
    lowStockItems: 4,
    availableDrivers: 18,
    totalDrivers: 22,
    joiningDate: daysAgoIso(420),
    status: "ACTIVE",
  },
  {
    id: "mgr-002",
    employeeId: "BQ-MGR-002",
    name: "Kavita Mehta",
    phone: "+91 98201 11002",
    email: "kavita.mehta@bqindia.com",
    hubId: "hub-pun-01",
    hubName: "Pune West Hub",
    hubCode: "PUN-01",
    warehouse: "Pune Regional Warehouse",
    region: "West Region",
    city: "Pune",
    pendingRequisitions: 7,
    pendingDispatches: 16,
    todayOrders: 41,
    lowStockItems: 12,
    availableDrivers: 12,
    totalDrivers: 18,
    joiningDate: daysAgoIso(380),
    status: "BUSY",
  },
  {
    id: "mgr-003",
    employeeId: "BQ-MGR-003",
    name: "Rahul Singh",
    phone: "+91 98201 11003",
    email: "rahul.singh@bqindia.com",
    hubId: "hub-del-01",
    hubName: "Delhi South Hub",
    hubCode: "DEL-01",
    warehouse: "Delhi Central Warehouse",
    region: "North Region",
    city: "Delhi",
    pendingRequisitions: 2,
    pendingDispatches: 5,
    todayOrders: 19,
    lowStockItems: 3,
    availableDrivers: 11,
    totalDrivers: 14,
    joiningDate: daysAgoIso(510),
    status: "ACTIVE",
  },
  {
    id: "mgr-004",
    employeeId: "BQ-MGR-004",
    name: "Suresh Gupta",
    phone: "+91 98201 11004",
    email: "suresh.gupta@bqindia.com",
    hubId: "hub-gur-01",
    hubName: "Gurgaon Central Hub",
    hubCode: "GUR-01",
    warehouse: "NCR Regional Warehouse",
    region: "North NCR",
    city: "Gurgaon",
    pendingRequisitions: 6,
    pendingDispatches: 20,
    todayOrders: 55,
    lowStockItems: 15,
    availableDrivers: 14,
    totalDrivers: 20,
    joiningDate: daysAgoIso(290),
    status: "ATTENTION",
  },
  {
    id: "mgr-005",
    employeeId: "BQ-MGR-005",
    name: "Priya Reddy",
    phone: "+91 98201 11005",
    email: "priya.reddy@bqindia.com",
    hubId: "hub-hyd-01",
    hubName: "Hyderabad East Hub",
    hubCode: "HYD-01",
    warehouse: "Hyderabad Warehouse",
    region: "South Region",
    city: "Hyderabad",
    pendingRequisitions: 9,
    pendingDispatches: 18,
    todayOrders: 48,
    lowStockItems: 11,
    availableDrivers: 10,
    totalDrivers: 16,
    joiningDate: daysAgoIso(615),
    status: "ATTENTION",
  },
  {
    id: "mgr-006",
    employeeId: "BQ-MGR-006",
    name: "Deepa Iyer",
    phone: "+91 98201 11006",
    email: "deepa.iyer@bqindia.com",
    hubId: "hub-che-01",
    hubName: "Chennai Central Hub",
    hubCode: "CHE-01",
    warehouse: "Chennai Warehouse",
    region: "South Region",
    city: "Chennai",
    pendingRequisitions: 1,
    pendingDispatches: 4,
    todayOrders: 14,
    lowStockItems: 2,
    availableDrivers: 8,
    totalDrivers: 10,
    joiningDate: daysAgoIso(720),
    status: "LEAVE",
  },
];

// ─── Generated managers ────────────────────────────────────────────────────────

const TOTAL_MANAGERS = 24;

function buildGeneratedManager(index: number): SubHubManager {
  const hub = MANAGER_HUBS[index % MANAGER_HUBS.length];
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
    employeeId: `BQ-MGR-${String(index + 7).padStart(3, "0")}`,
    name: `${firstName} ${lastName}`,
    phone: `+91 98${String(10000000 + hash).slice(0, 8)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bqindia.com`,
    hubId: hub.hubId,
    hubName: hub.hubName,
    hubCode: hub.hubCode,
    warehouse: hub.warehouse,
    region: REGIONS[hub.hubId] ?? "West Region",
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
  if (filters.status !== "all" && manager.status !== filters.status) {
    return false;
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
    managersNeedAttention: managers.filter(
      (m) =>
        m.pendingRequisitions > 5 ||
        m.lowStockItems > 10 ||
        m.pendingDispatches > 15,
    ).length,
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
  const hub =
    MANAGER_HUBS.find((h) => h.hubId === manager.hubId) ?? MANAGER_HUBS[0];

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
    ...new Set(MANAGER_HUBS.map((h) => REGIONS[h.hubId] ?? "West Region")),
  ];
  return {
    regions: regions.map((r) => ({ value: r, label: r })),
    hubs: MANAGER_HUBS.map((h) => ({ value: h.hubId, label: h.hubName })),
    statuses: (["ACTIVE", "BUSY", "ATTENTION", "LEAVE"] as const).map((s) => ({
      value: s,
      label: s.charAt(0) + s.slice(1).toLowerCase(),
    })),
    warehouses: WAREHOUSES.map((w) => ({ value: w, label: w })),
  };
}
