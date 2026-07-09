import {
  CUSTOMER_EXECUTIVES,
  CUSTOMER_HUBS,
  CUSTOMER_ORDERS_SEED,
  CUSTOMER_SEED,
} from "@/mock/customers";
import type {
  CustomerActivityEvent,
  CustomerAssignedOperations,
  CustomerDetail,
  CustomerExecutive,
  CustomerFilters,
  CustomerHub,
  CustomerListItem,
  CustomerOrder,
  CustomerOrderSummary,
  CustomerQueryParams,
  CustomerQueryResult,
  CustomerRecord,
  CustomerStats,
} from "@/features/user-management/types/customer.types";

const ACTIVE_ORDER_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

function isActiveOrder(status: CustomerOrder["status"]): boolean {
  return !ACTIVE_ORDER_STATUSES.has(status);
}

function getHubById(
  hubId: string,
  hubs: CustomerHub[],
): CustomerHub | undefined {
  return hubs.find((hub) => hub.id === hubId);
}

function getExecutiveByHubId(
  hubId: string,
  executives: CustomerExecutive[],
): CustomerExecutive | undefined {
  return executives.find((executive) => executive.hubId === hubId);
}

function getCustomerOrders(
  customerId: string,
  orders: CustomerOrder[],
): CustomerOrder[] {
  return orders
    .filter((order) => order.customerId === customerId)
    .sort((left, right) => right.date.localeCompare(left.date));
}

function computeOrderSummary(orders: CustomerOrder[]): CustomerOrderSummary {
  const activeOrders = orders.filter((order) => isActiveOrder(order.status));
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  );
  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  );

  return {
    totalOrders: orders.length,
    activeOrders: activeOrders.length,
    deliveredOrders: deliveredOrders.length,
    cancelledOrders: cancelledOrders.length,
    lastOrderDate: orders[0]?.date ?? null,
  };
}

function computeAssignedOperations(
  orders: CustomerOrder[],
  hubs: CustomerHub[],
  executives: CustomerExecutive[],
): CustomerAssignedOperations {
  if (orders.length === 0) {
    return {
      hubName: "Not Assigned",
      executiveName: "Not Assigned",
      isAssigned: false,
    };
  }

  const sortedOrders = [...orders].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  const firstOrder = sortedOrders[0];
  const hub = getHubById(firstOrder.hubId, hubs);
  const executive = getExecutiveByHubId(firstOrder.hubId, executives);

  return {
    hubId: hub?.id,
    hubName: hub?.name ?? "Not Assigned",
    hubLocation: hub ? `${hub.city}, ${hub.state}` : undefined,
    executiveId: executive?.id,
    executiveName: executive?.name ?? "Not Assigned",
    executiveContact: executive?.phone,
    isAssigned: Boolean(hub && executive),
  };
}

export function enrichCustomer(
  customer: CustomerRecord,
  orders: CustomerOrder[],
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
): CustomerListItem {
  const customerOrders = getCustomerOrders(customer.id, orders);
  const orderSummary = computeOrderSummary(customerOrders);
  const assignedOperations = computeAssignedOperations(
    customerOrders,
    hubs,
    executives,
  );

  return {
    ...customer,
    assignedHub: assignedOperations.hubName,
    assignedExecutive: assignedOperations.executiveName,
    activeOrders: orderSummary.activeOrders,
    lastOrderDate: orderSummary.lastOrderDate,
    assignedOperations,
    orderSummary,
  };
}

export function enrichCustomers(
  customers: CustomerRecord[],
  orders: CustomerOrder[],
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
): CustomerListItem[] {
  return customers.map((customer) =>
    enrichCustomer(customer, orders, hubs, executives),
  );
}

export function computeCustomerStats(
  customers: CustomerListItem[],
): CustomerStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newToday = customers.filter((customer) => {
    const registered = new Date(customer.registrationDate);
    registered.setHours(0, 0, 0, 0);
    return registered.getTime() === today.getTime();
  }).length;

  return {
    total: customers.length,
    active: customers.filter((customer) => customer.status === "ACTIVE").length,
    pendingVerification: customers.filter(
      (customer) => customer.status === "PENDING_VERIFICATION",
    ).length,
    blocked: customers.filter((customer) => customer.status === "BLOCKED")
      .length,
    newToday,
  };
}

function matchesSearch(customer: CustomerListItem, search: string): boolean {
  if (!search.trim()) {
    return true;
  }

  const query = search.trim().toLowerCase();

  return (
    customer.name.toLowerCase().includes(query) ||
    customer.customerId.toLowerCase().includes(query) ||
    customer.phone.toLowerCase().includes(query)
  );
}

function matchesFilters(
  customer: CustomerListItem,
  filters: CustomerFilters,
): boolean {
  if (filters.status !== "all" && customer.status !== filters.status) {
    return false;
  }

  if (
    filters.customerType !== "all" &&
    customer.customerType !== filters.customerType
  ) {
    return false;
  }

  if (
    filters.assignedHub !== "all" &&
    customer.assignedOperations.hubId !== filters.assignedHub
  ) {
    return false;
  }

  if (
    filters.assignedExecutive !== "all" &&
    customer.assignedOperations.executiveId !== filters.assignedExecutive
  ) {
    return false;
  }

  if (filters.state !== "all" && customer.address.state !== filters.state) {
    return false;
  }

  if (
    filters.city.trim() &&
    !customer.address.city
      .toLowerCase()
      .includes(filters.city.trim().toLowerCase())
  ) {
    return false;
  }

  if (filters.registrationDateFrom) {
    const from = new Date(filters.registrationDateFrom);
    const registered = new Date(customer.registrationDate);
    if (registered < from) {
      return false;
    }
  }

  if (filters.registrationDateTo) {
    const to = new Date(filters.registrationDateTo);
    to.setHours(23, 59, 59, 999);
    const registered = new Date(customer.registrationDate);
    if (registered > to) {
      return false;
    }
  }

  return matchesSearch(customer, filters.search);
}

export function fetchCustomers(
  customers: CustomerRecord[],
  orders: CustomerOrder[],
  params: CustomerQueryParams,
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
): CustomerQueryResult {
  const enriched = enrichCustomers(customers, orders, hubs, executives);
  const filtered = enriched.filter((customer) =>
    matchesFilters(customer, params.filters),
  );
  const stats = computeCustomerStats(enriched);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * params.limit;
  const data = filtered.slice(start, start + params.limit);

  return {
    data,
    meta: {
      total,
      page,
      limit: params.limit,
      totalPages,
    },
    stats,
  };
}

export function getCustomerDetail(
  customerId: string,
  customers: CustomerRecord[],
  orders: CustomerOrder[],
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
): CustomerDetail | null {
  const customer = customers.find(
    (entry) => entry.id === customerId || entry.customerId === customerId,
  );

  if (!customer) {
    return null;
  }

  const enriched = enrichCustomer(customer, orders, hubs, executives);
  const customerOrders = getCustomerOrders(customer.id, orders);

  return {
    ...enriched,
    orders: customerOrders,
    serviceHub: enriched.assignedOperations.isAssigned
      ? enriched.assignedOperations.hubName
      : "Awaiting first order",
  };
}

export function buildCustomerActivityTimeline(
  customer: CustomerListItem,
): CustomerActivityEvent[] {
  const events: CustomerActivityEvent[] = [
    {
      type: "REGISTERED",
      label: "Registered",
      date: customer.activity.registeredAt,
      description: "Customer account created on the platform.",
    },
  ];

  if (customer.activity.kycVerifiedAt) {
    events.push({
      type: "KYC_VERIFIED",
      label: "KYC Verified",
      date: customer.activity.kycVerifiedAt,
      description: "Identity verification completed.",
    });
  }

  if (customer.activity.firstLoginAt) {
    events.push({
      type: "FIRST_LOGIN",
      label: "First Login",
      date: customer.activity.firstLoginAt,
      description: "Customer opened the mobile app for the first time.",
    });
  }

  if (customer.activity.firstOrderAt) {
    events.push({
      type: "FIRST_ORDER",
      label: "First Order",
      date: customer.activity.firstOrderAt,
      description: "First order placed on the platform.",
    });
  }

  if (customer.activity.executiveAssignedAt) {
    events.push({
      type: "EXECUTIVE_ASSIGNED",
      label: "Executive Assigned",
      date: customer.activity.executiveAssignedAt,
      description: `Assigned to ${customer.assignedExecutive} at ${customer.assignedHub}.`,
    });
  }

  if (
    customer.activity.latestOrderAt &&
    customer.activity.latestOrderAt !== customer.activity.firstOrderAt
  ) {
    events.push({
      type: "LATEST_ORDER",
      label: "Latest Order",
      date: customer.activity.latestOrderAt,
      description: "Most recent order placed.",
    });
  }

  return events.sort((left, right) => left.date.localeCompare(right.date));
}

export function getFilterOptions(
  customers: CustomerListItem[],
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
) {
  const states = [
    ...new Set(customers.map((customer) => customer.address.state)),
  ].sort();

  return {
    hubs: hubs.map((hub) => ({ value: hub.id, label: hub.name })),
    executives: executives.map((executive) => ({
      value: executive.id,
      label: executive.name,
    })),
    states: states.map((state) => ({ value: state, label: state })),
  };
}

export {
  CUSTOMER_SEED,
  CUSTOMER_ORDERS_SEED,
  CUSTOMER_HUBS,
  CUSTOMER_EXECUTIVES,
};
