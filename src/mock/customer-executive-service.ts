import {
  CUSTOMER_EXECUTIVES,
  CUSTOMER_HUBS,
  CUSTOMER_SEED,
} from "@/mock/customers";
import type {
  CustomerOrder,
  CustomerRecord,
} from "@/features/user-management/types/customer.types";
import type {
  CustomerExecutiveRecord,
  ExecutiveAssignedCustomerRow,
  ExecutiveDashboardStats,
  ExecutiveFilters,
  ExecutiveOrderRow,
  ExecutiveProfileDetail,
  ExecutiveQueryParams,
  ExecutiveQueryResult,
  ExecutiveAvailabilityStatus,
  SupportExecutiveAssignmentHistoryEntry,
} from "@/features/user-management/types/support-executive.types";

const HUB_REGIONS: Record<string, string> = {
  "hub-mumbai-central": "West Region",
  "hub-pune-west": "West Region",
  "hub-nagpur-north": "Central Region",
  "hub-delhi-south": "North Region",
  "hub-gurgaon-central": "North NCR",
  "hub-noida-62": "North NCR",
};

const REGION_OPTIONS = [
  "all",
  "West Region",
  "Central Region",
  "North Region",
  "North NCR",
];

const FIRST_NAMES = [
  "Priya",
  "Rahul",
  "Anjali",
  "Vikram",
  "Meera",
  "Arjun",
  "Kavita",
  "Suresh",
  "Deepa",
  "Amit",
  "Neha",
  "Rohan",
  "Pooja",
  "Sanjay",
  "Ananya",
  "Pritam",
  "Rajesh",
  "Sneha",
  "Karan",
  "Divya",
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
];

const STATUSES: ExecutiveAvailabilityStatus[] = [
  "AVAILABLE",
  "BUSY",
  "OFFLINE",
  "LEAVE",
];

const BASE_TODAY_CALLS: Record<string, number> = {
  "exec-001": 24,
  "exec-002": 18,
  "exec-003": 31,
  "exec-004": 15,
  "exec-005": 0,
  "exec-006": 22,
};

const TOTAL_EXECUTIVES = 182;
const JOINED_THIS_MONTH = 8;
const MOCK_CALLS_ASSISTED = 842;

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function hashString(value: string): number {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getHubName(hubId: string): string {
  return CUSTOMER_HUBS.find((hub) => hub.id === hubId)?.name ?? "Unknown Hub";
}

function getRegion(hubId: string): string {
  return HUB_REGIONS[hubId] ?? "West Region";
}

function buildGeneratedExecutive(index: number): CustomerExecutiveRecord {
  const hub = CUSTOMER_HUBS[index % CUSTOMER_HUBS.length];
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const id = `exec-gen-${String(index + 1).padStart(3, "0")}`;
  const status = STATUSES[hashString(id) % STATUSES.length];
  const joiningDaysAgo = 30 + (hashString(id) % 500);

  return {
    id,
    employeeId: `BQ-EXEC-${String(index + 7).padStart(3, "0")}`,
    name: `${firstName} ${lastName}`,
    phone: `+91 98${String(10000000 + hashString(id)).slice(0, 8)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bqindia.com`,
    hubId: hub.id,
    hub: hub.name,
    region: getRegion(hub.id),
    assignedCustomers: 8 + (hashString(id) % 40),
    todayOrders:
      status === "OFFLINE" || status === "LEAVE" ? 0 : hashString(id) % 15,
    totalOrders: 120 + (hashString(id) % 1800),
    todayCalls:
      status === "OFFLINE" || status === "LEAVE"
        ? 0
        : 5 + (hashString(id) % 30),
    status,
    joiningDate: daysAgoIso(joiningDaysAgo),
  };
}

function buildCoreExecutiveRecord(
  executive: (typeof CUSTOMER_EXECUTIVES)[number],
  index: number,
  orders: CustomerOrder[],
  history: SupportExecutiveAssignmentHistoryEntry[],
  customers: CustomerRecord[],
): CustomerExecutiveRecord {
  const hub = CUSTOMER_HUBS.find((entry) => entry.id === executive.hubId);
  const employeeId = `BQ-EXEC-${String(index + 1).padStart(3, "0")}`;
  const status = STATUSES[hashString(executive.id) % STATUSES.length];
  const executiveOrders = orders.filter(
    (order) =>
      order.orderSource === "CUSTOMER_EXECUTIVE" &&
      order.executiveId === executive.id,
  );
  const todayOrders = executiveOrders.filter((order) => isToday(order.date));
  const assignedCustomers = history.filter(
    (entry) => entry.executiveId === executive.id && entry.status === "CURRENT",
  ).length;

  const fallbackCustomers = customers.filter(
    (customer) =>
      customer.supportExecutiveAssignment?.executiveId === executive.id,
  ).length;

  return {
    id: executive.id,
    employeeId,
    name: executive.name,
    phone: executive.phone,
    email: executive.email,
    hubId: executive.hubId,
    hub: hub?.name ?? "Unknown Hub",
    region: getRegion(executive.hubId),
    assignedCustomers: Math.max(assignedCustomers, fallbackCustomers),
    todayOrders: todayOrders.length,
    totalOrders: executiveOrders.length,
    todayCalls:
      BASE_TODAY_CALLS[executive.id] ?? 10 + (hashString(executive.id) % 20),
    status,
    joiningDate: daysAgoIso(120 + index * 45),
  };
}

export function buildAllExecutives(
  orders: CustomerOrder[],
  history: SupportExecutiveAssignmentHistoryEntry[],
  customers: CustomerRecord[],
): CustomerExecutiveRecord[] {
  const core = CUSTOMER_EXECUTIVES.map((executive, index) =>
    buildCoreExecutiveRecord(executive, index, orders, history, customers),
  );

  const generatedCount = TOTAL_EXECUTIVES - core.length;
  const generated = Array.from({ length: generatedCount }, (_, index) =>
    buildGeneratedExecutive(index),
  );

  return [...core, ...generated];
}

function matchesExecutiveFilters(
  executive: CustomerExecutiveRecord,
  filters: ExecutiveFilters,
): boolean {
  if (filters.region !== "all" && executive.region !== filters.region) {
    return false;
  }

  if (filters.hubId !== "all" && executive.hubId !== filters.hubId) {
    return false;
  }

  if (filters.status !== "all" && executive.status !== filters.status) {
    return false;
  }

  if (filters.activity === "orders-today" && executive.todayOrders <= 0) {
    return false;
  }

  if (filters.activity === "calls-assisted" && executive.todayCalls <= 0) {
    return false;
  }

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    const matches =
      executive.name.toLowerCase().includes(query) ||
      executive.employeeId.toLowerCase().includes(query) ||
      executive.phone.toLowerCase().includes(query) ||
      executive.email.toLowerCase().includes(query);

    if (!matches) {
      return false;
    }
  }

  return true;
}

export function computeExecutiveDashboardStats(
  executives: CustomerExecutiveRecord[],
  orders: CustomerOrder[],
): ExecutiveDashboardStats {
  const ordersCreatedToday = orders.filter(
    (order) =>
      order.orderSource === "CUSTOMER_EXECUTIVE" && isToday(order.date),
  ).length;

  return {
    totalExecutives: executives.length,
    availableToday: executives.filter(
      (executive) => executive.status === "AVAILABLE",
    ).length,
    ordersCreatedToday,
    customerCallsAssisted: MOCK_CALLS_ASSISTED,
    joinedThisMonth: JOINED_THIS_MONTH,
  };
}

export function queryExecutives(
  executives: CustomerExecutiveRecord[],
  orders: CustomerOrder[],
  params: ExecutiveQueryParams,
): ExecutiveQueryResult {
  const filtered = executives
    .filter((executive) => matchesExecutiveFilters(executive, params.filters))
    .sort((left, right) => left.name.localeCompare(right.name));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * params.limit;

  return {
    data: filtered.slice(start, start + params.limit),
    meta: {
      total,
      page,
      limit: params.limit,
      totalPages,
    },
    stats: computeExecutiveDashboardStats(executives, orders),
  };
}

export function getExecutiveProfile(
  executiveId: string,
  executives: CustomerExecutiveRecord[],
  orders: CustomerOrder[],
  customers: CustomerRecord[],
  history: SupportExecutiveAssignmentHistoryEntry[],
): ExecutiveProfileDetail | null {
  const executive = executives.find((entry) => entry.id === executiveId);

  if (!executive) {
    return null;
  }

  const customerNameById = new Map(
    customers.map((customer) => [customer.id, customer.name]),
  );

  const recentOrders: ExecutiveOrderRow[] = orders
    .filter(
      (order) =>
        order.orderSource === "CUSTOMER_EXECUTIVE" &&
        order.executiveId === executiveId,
    )
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      orderId: order.orderId,
      customerName:
        customerNameById.get(order.customerId) ?? "Unknown Customer",
      hub: getHubName(order.hubId),
      amount: order.amount,
      orderSource: order.orderSource,
      date: order.date,
      status: order.status,
    }));

  const assignedCustomerRows: ExecutiveAssignedCustomerRow[] = customers
    .filter(
      (customer) =>
        customer.supportExecutiveAssignment?.executiveId === executiveId,
    )
    .map((customer) => {
      const customerOrders = orders.filter(
        (order) => order.customerId === customer.id,
      );
      const lastOrder = customerOrders.sort((left, right) =>
        right.date.localeCompare(left.date),
      )[0];

      return {
        id: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        city: customer.address.city,
        lastOrderDate: lastOrder?.date ?? null,
        assignedSince:
          customer.supportExecutiveAssignment?.assignedDate ??
          customer.activity.executiveAssignedAt ??
          customer.registrationDate,
        status:
          customerOrders.length === 0
            ? "NEW_LEAD"
            : customer.status === "ACTIVE"
              ? "ACTIVE"
              : "INACTIVE",
      };
    });

  const historyCustomers: ExecutiveAssignedCustomerRow[] = history
    .filter(
      (entry) =>
        entry.executiveId === executiveId && entry.status === "CURRENT",
    )
    .flatMap((entry) => {
      const customer = customers.find((c) => c.id === entry.customerId);
      if (!customer) return [];
      if (assignedCustomerRows.some((row) => row.id === customer.id)) {
        return [];
      }

      const customerOrders = orders.filter(
        (order) => order.customerId === customer.id,
      );
      const lastOrder = customerOrders.sort((left, right) =>
        right.date.localeCompare(left.date),
      )[0];

      return [
        {
          id: customer.id,
          customerName: customer.name,
          phone: customer.phone,
          city: customer.address.city,
          lastOrderDate: lastOrder?.date ?? null,
          assignedSince: entry.assignedDate,
          status: "ACTIVE" as const,
        },
      ];
    });

  const regionLabel = `${executive.region} (${executive.hub.split(" ")[0]})`;

  return {
    ...executive,
    assignedRegions: [regionLabel],
    recentOrders,
    assignedCustomerRows: [...assignedCustomerRows, ...historyCustomers],
  };
}

export function getExecutiveFilterOptions() {
  return {
    regions: REGION_OPTIONS.filter((region) => region !== "all").map(
      (region) => ({
        value: region,
        label: region,
      }),
    ),
    hubs: CUSTOMER_HUBS.map((hub) => ({
      value: hub.id,
      label: hub.name,
    })),
    statuses: STATUSES.map((status) => ({
      value: status,
      label: status.charAt(0) + status.slice(1).toLowerCase(),
    })),
  };
}

export { CUSTOMER_SEED };
