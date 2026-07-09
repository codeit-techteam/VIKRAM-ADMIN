import { CUSTOMER_EXECUTIVES, CUSTOMER_HUBS } from "@/mock/customers";
import type {
  ExecutiveAvailabilityStatus,
  SupportExecutive,
  SupportExecutiveAssignmentHistoryEntry,
  SupportExecutiveFilters,
} from "@/features/user-management/types/support-executive.types";
import type { CustomerRecord } from "@/features/user-management/types/customer.types";

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

const EXECUTIVE_STATUS_BY_ID: Record<string, ExecutiveAvailabilityStatus> = {
  "exec-001": "AVAILABLE",
  "exec-002": "BUSY",
  "exec-003": "AVAILABLE",
  "exec-004": "BUSY",
  "exec-005": "OFFLINE",
  "exec-006": "AVAILABLE",
};

const EMPLOYEE_IDS: Record<string, string> = {
  "exec-001": "EMP-SE-1001",
  "exec-002": "EMP-SE-1002",
  "exec-003": "EMP-SE-1003",
  "exec-004": "EMP-SE-1004",
  "exec-005": "EMP-SE-1005",
  "exec-006": "EMP-SE-1006",
};

const BASE_OPEN_TICKETS: Record<string, number> = {
  "exec-001": 3,
  "exec-002": 7,
  "exec-003": 2,
  "exec-004": 5,
  "exec-005": 0,
  "exec-006": 4,
};

function hashString(value: string): number {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function countCurrentAssignments(
  executiveId: string,
  history: SupportExecutiveAssignmentHistoryEntry[],
): number {
  return history.filter(
    (entry) => entry.executiveId === executiveId && entry.status === "CURRENT",
  ).length;
}

export function buildSupportExecutives(
  history: SupportExecutiveAssignmentHistoryEntry[] = [],
): SupportExecutive[] {
  return CUSTOMER_EXECUTIVES.map((executive) => {
    const hub = CUSTOMER_HUBS.find((entry) => entry.id === executive.hubId);
    const activeCustomers = countCurrentAssignments(executive.id, history);

    return {
      id: executive.id,
      employeeId:
        EMPLOYEE_IDS[executive.id] ?? `EMP-SE-${executive.id.slice(-4)}`,
      name: executive.name,
      phone: executive.phone,
      email: executive.email,
      hubId: executive.hubId,
      hubName: hub?.name ?? "Unknown Hub",
      status: EXECUTIVE_STATUS_BY_ID[executive.id] ?? "AVAILABLE",
      activeCustomers,
      openTickets:
        BASE_OPEN_TICKETS[executive.id] ?? 2 + (hashString(executive.id) % 6),
    };
  });
}

export function getSupportExecutiveById(
  executiveId: string,
  history: SupportExecutiveAssignmentHistoryEntry[] = [],
): SupportExecutive | undefined {
  return buildSupportExecutives(history).find(
    (executive) => executive.id === executiveId,
  );
}

function matchesExecutiveSearch(
  executive: SupportExecutive,
  search: string,
): boolean {
  if (!search.trim()) {
    return true;
  }

  const query = search.trim().toLowerCase();

  return (
    executive.name.toLowerCase().includes(query) ||
    executive.employeeId.toLowerCase().includes(query) ||
    executive.hubName.toLowerCase().includes(query)
  );
}

export function filterSupportExecutives(
  executives: SupportExecutive[],
  filters: SupportExecutiveFilters,
): SupportExecutive[] {
  return executives.filter((executive) => {
    if (filters.hubId !== "all" && executive.hubId !== filters.hubId) {
      return false;
    }

    if (filters.status !== "all" && executive.status !== filters.status) {
      return false;
    }

    return matchesExecutiveSearch(executive, filters.search);
  });
}

export function getCustomerAssignmentHistory(
  customerId: string,
  history: SupportExecutiveAssignmentHistoryEntry[],
): SupportExecutiveAssignmentHistoryEntry[] {
  return history
    .filter((entry) => entry.customerId === customerId)
    .sort((left, right) => right.assignedDate.localeCompare(left.assignedDate));
}

export function getExecutiveDashboardSummary(
  history: SupportExecutiveAssignmentHistoryEntry[],
) {
  const executives = buildSupportExecutives(history);

  return executives.map((executive) => ({
    executiveId: executive.id,
    executiveName: executive.name,
    employeeId: executive.employeeId,
    hubName: executive.hubName,
    status: executive.status,
    activeCustomers: executive.activeCustomers,
    openTickets: executive.openTickets,
  }));
}

export const SUPPORT_EXECUTIVE_ASSIGNMENT_HISTORY_SEED: SupportExecutiveAssignmentHistoryEntry[] =
  [
    {
      id: "sea-hist-001-prev",
      customerId: "cust-001",
      executiveId: "exec-002",
      executiveName: "Rahul Deshmukh",
      employeeId: "EMP-SE-1002",
      hubId: "hub-pune-west",
      hubName: "Pune West Hub",
      assignedBy: "Admin User",
      reason: "CUSTOMER_SUPPORT",
      priority: "MEDIUM",
      notes: "Initial onboarding support.",
      assignedDate: daysAgoIso(160),
      removedDate: daysAgoIso(120),
      removedReason: "Executive changed for hub alignment.",
      status: "PREVIOUS",
    },
    {
      id: "sea-hist-001-current",
      customerId: "cust-001",
      executiveId: "exec-001",
      executiveName: "Priya Nair",
      employeeId: "EMP-SE-1001",
      hubId: "hub-mumbai-central",
      hubName: "Mumbai Central Hub",
      assignedBy: "Admin User",
      reason: "RELATIONSHIP_MANAGEMENT",
      priority: "HIGH",
      notes: "Key builder account — dedicated relationship manager.",
      assignedDate: daysAgoIso(120),
      status: "CURRENT",
    },
    {
      id: "sea-hist-003-current",
      customerId: "cust-003",
      executiveId: "exec-003",
      executiveName: "Anjali Patil",
      employeeId: "EMP-SE-1003",
      hubId: "hub-nagpur-north",
      hubName: "Nagpur North Hub",
      assignedBy: "Compliance Team",
      reason: "KYC_VERIFICATION",
      priority: "MEDIUM",
      assignedDate: daysAgoIso(45),
      status: "CURRENT",
    },
  ];

export function syncCustomersWithAssignmentHistory(
  customers: CustomerRecord[],
  history: SupportExecutiveAssignmentHistoryEntry[],
): CustomerRecord[] {
  return customers.map((customer) => {
    const current = history.find(
      (entry) => entry.customerId === customer.id && entry.status === "CURRENT",
    );

    if (!current) {
      return customer;
    }

    const executive = CUSTOMER_EXECUTIVES.find(
      (entry) => entry.id === current.executiveId,
    );

    if (!executive) {
      return customer;
    }

    return {
      ...customer,
      supportExecutiveAssignment: {
        executiveId: current.executiveId,
        executiveName: current.executiveName,
        employeeId: current.employeeId,
        hubId: current.hubId,
        hubName: current.hubName,
        phone: executive.phone,
        email: executive.email,
        reason: current.reason,
        priority: current.priority,
        notes: current.notes,
        assignedDate: current.assignedDate,
        assignedBy: current.assignedBy,
      },
      activity: {
        ...customer.activity,
        executiveAssignedAt:
          customer.activity.executiveAssignedAt ?? current.assignedDate,
      },
    };
  });
}

export { CUSTOMER_EXECUTIVES, CUSTOMER_HUBS };
