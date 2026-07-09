export type ManagerStatus = "ACTIVE" | "BUSY" | "ATTENTION" | "LEAVE";

export interface SubHubManager {
  id: string;
  employeeId: string;
  name: string;
  photo?: string;
  phone: string;
  email: string;
  hubId: string;
  hubName: string;
  hubCode: string;
  warehouse: string;
  region: string;
  city: string;
  status: ManagerStatus;
  pendingRequisitions: number;
  pendingDispatches: number;
  todayOrders: number;
  lowStockItems: number;
  availableDrivers: number;
  totalDrivers: number;
  joiningDate: string;
}

export interface HubSummary {
  hubId: string;
  hubName: string;
  hubCode: string;
  city: string;
  warehouse: string;
  coverageRadius: string;
  pendingRequisitions: number;
  pendingDispatches: number;
  todayOrders: number;
  lowStockItems: number;
  drivers: number;
}

export interface ManagerRequisitionRow {
  id: string;
  reqId: string;
  material: string;
  requestedQty: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ManagerDispatchRow {
  id: string;
  dispatchId: string;
  customer: string;
  vehicle: string;
  driver: string;
  status: "READY" | "LOADING" | "PENDING";
}

export interface ManagerDriverRow {
  id: string;
  driverName: string;
  vehicle: string;
  currentStatus: "AVAILABLE" | "ON_ROUTE" | "LOADING" | "LEAVE";
  todayTrips: number;
}

export interface ManagerActivityEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface ManagerFilters {
  search: string;
  region: string;
  hubId: string;
  status: string;
  warehouse: string;
}

export interface ManagerQueryParams {
  page: number;
  limit: number;
  filters: ManagerFilters;
}

export interface ManagerDashboardStats {
  totalManagers: number;
  managersAvailable: number;
  managersNeedAttention: number;
  managersOnLeave: number;
}

export interface ManagerQueryResult {
  data: SubHubManager[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: ManagerDashboardStats;
}

export interface ManagerProfileDetail extends SubHubManager {
  hub: HubSummary;
  recentActivity: ManagerActivityEvent[];
  pendingRequisitionRows: ManagerRequisitionRow[];
  pendingDispatchRows: ManagerDispatchRow[];
  driverRows: ManagerDriverRow[];
}

export interface CreateManagerPayload {
  name: string;
  phone: string;
  email: string;
  employeeId: string;
  hubId: string;
  warehouse: string;
  region: string;
  permissions: {
    inventory: boolean;
    dispatch: boolean;
    requisition: boolean;
    drivers: boolean;
    reports: boolean;
  };
}

export interface TransferHubPayload {
  managerId: string;
  newHubId: string;
  reason: string;
  effectiveDate: string;
}

export const MANAGER_STATUS_LABELS: Record<ManagerStatus, string> = {
  ACTIVE: "Active",
  BUSY: "Busy",
  ATTENTION: "Attention",
  LEAVE: "Leave",
};

export const MANAGER_STATUS_STYLES: Record<
  ManagerStatus,
  { badge: string; dot: string }
> = {
  ACTIVE: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  BUSY: {
    badge: "bg-orange-50 text-orange-700 border border-orange-100",
    dot: "bg-orange-500",
  },
  ATTENTION: {
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  LEAVE: {
    badge: "bg-red-50 text-red-600 border border-red-100",
    dot: "bg-red-400",
  },
};

export const EMPTY_MANAGER_FILTERS: ManagerFilters = {
  search: "",
  region: "all",
  hubId: "all",
  status: "all",
  warehouse: "all",
};

export const MANAGER_PAGE_SIZE = 10;
export const MANAGER_CARDS_PAGE_SIZE = 4;
