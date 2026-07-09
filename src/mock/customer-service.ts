import {
  CUSTOMER_ADDRESSES_SEED,
  CUSTOMER_EXECUTIVES,
  CUSTOMER_HUBS,
  CUSTOMER_ORDERS_SEED,
  CUSTOMER_SEED,
} from "@/mock/customers";
import type {
  CustomerActivityEvent,
  CustomerAssignedOperations,
  CustomerDeliveryAddress,
  CustomerDetail,
  CustomerEditPayload,
  CustomerExecutive,
  CustomerFilters,
  CustomerHub,
  CustomerListItem,
  CustomerOrder,
  CustomerOrderDetail,
  CustomerOrderProduct,
  CustomerOrderStatus,
  CustomerOrderSummary,
  CustomerOrderTimelineEvent,
  CustomerQueryParams,
  CustomerQueryResult,
  CustomerRecord,
  CustomerStats,
} from "@/features/user-management/types/customer.types";

const TERMINAL_ORDER_STATUSES = new Set<CustomerOrderStatus>([
  "DELIVERED",
  "CANCELLED",
]);

const ORDER_STATUS_FLOW: CustomerOrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "PACKED",
  "DISPATCHED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const PRODUCT_TEMPLATES = [
  { name: "Portland Cement 50kg", unit: "bags", basePrice: 380 },
  { name: "TMT Steel Bars 12mm", unit: "tons", basePrice: 62000 },
  { name: "River Sand", unit: "cubic ft", basePrice: 55 },
  { name: "AAC Blocks 600x200", unit: "pieces", basePrice: 78 },
  { name: "Ready Mix Concrete M25", unit: "cubic m", basePrice: 4800 },
  { name: "Waterproofing Compound", unit: "litres", basePrice: 420 },
];

const DRIVER_TEMPLATES = [
  {
    name: "Ramesh Yadav",
    phone: "+91 98765 11101",
    vehicleNumber: "MH-12-AB-1234",
  },
  {
    name: "Suresh Patil",
    phone: "+91 98765 11102",
    vehicleNumber: "MH-14-CD-5678",
  },
  {
    name: "Ajay Singh",
    phone: "+91 98765 11103",
    vehicleNumber: "DL-01-EF-9012",
  },
  {
    name: "Vikram Reddy",
    phone: "+91 98765 11104",
    vehicleNumber: "KA-05-GH-3456",
  },
];

function isActiveOrder(status: CustomerOrder["status"]): boolean {
  return !TERMINAL_ORDER_STATUSES.has(status);
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

function getCustomerAddresses(
  customerId: string,
  addresses: CustomerDeliveryAddress[],
): CustomerDeliveryAddress[] {
  return addresses
    .filter((address) => address.customerId === customerId)
    .sort((left, right) => Number(right.isDefault) - Number(left.isDefault));
}

export function getNearestHub(
  city: string,
  state: string,
  hubs: CustomerHub[] = CUSTOMER_HUBS,
): CustomerHub {
  return (
    hubs.find((hub) => hub.city.toLowerCase() === city.toLowerCase()) ??
    hubs.find((hub) => hub.state.toLowerCase() === state.toLowerCase()) ??
    hubs[0]
  );
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

function hashString(value: string): number {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildOrderProducts(order: CustomerOrder): CustomerOrderProduct[] {
  const count = 2 + (hashString(order.id) % 3);
  const startIndex = hashString(order.orderId) % PRODUCT_TEMPLATES.length;

  return Array.from({ length: count }, (_, index) => {
    const template =
      PRODUCT_TEMPLATES[(startIndex + index) % PRODUCT_TEMPLATES.length];
    const quantity = 5 + ((hashString(order.id + index) % 20) + 1);

    return {
      id: `${order.id}-product-${index}`,
      name: template.name,
      quantity,
      unit: template.unit,
      price: template.basePrice * quantity,
    };
  });
}

function buildOrderTimeline(
  order: CustomerOrder,
): CustomerOrderTimelineEvent[] {
  if (order.status === "CANCELLED") {
    return [
      {
        status: "PENDING",
        label: "Order Placed",
        timestamp: order.date,
      },
      {
        status: "CANCELLED",
        label: "Order Cancelled",
        timestamp: order.date,
        note: "Cancelled before dispatch.",
      },
    ];
  }

  const statusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const events = ORDER_STATUS_FLOW.slice(0, Math.max(statusIndex + 1, 1)).map(
    (status, index) => {
      const timestamp = new Date(order.date);
      timestamp.setHours(timestamp.getHours() + index * 6);

      const labels: Record<CustomerOrderStatus, string> = {
        PENDING: "Order Placed",
        PROCESSING: "Order Processing",
        PACKED: "Order Packed",
        DISPATCHED: "Dispatched from Hub",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
      };

      return {
        status,
        label: labels[status],
        timestamp: timestamp.toISOString(),
      };
    },
  );

  return events;
}

export function getOrderDetail(
  orderId: string,
  orders: CustomerOrder[],
  customers: CustomerRecord[],
  addresses: CustomerDeliveryAddress[],
  hubs: CustomerHub[] = CUSTOMER_HUBS,
  executives: CustomerExecutive[] = CUSTOMER_EXECUTIVES,
): CustomerOrderDetail | null {
  const order = orders.find(
    (entry) => entry.id === orderId || entry.orderId === orderId,
  );

  if (!order) {
    return null;
  }

  const customer = customers.find((entry) => entry.id === order.customerId);

  if (!customer) {
    return null;
  }

  const hub = getHubById(order.hubId, hubs);
  const executive = getExecutiveByHubId(order.hubId, executives);
  const customerAddresses = getCustomerAddresses(order.customerId, addresses);
  const deliveryAddress = customerAddresses.find(
    (address) => address.isDefault,
  ) ??
    customerAddresses[0] ?? {
      id: `addr-${customer.id}-fallback`,
      customerId: customer.id,
      recipient: customer.name,
      phone: customer.phone,
      address: customer.address.primaryAddress,
      city: customer.address.city,
      state: customer.address.state,
      pincode: customer.address.pincode,
      serviceHubId: hub?.id ?? hubs[0].id,
      serviceHubName: hub?.name ?? hubs[0].name,
      isDefault: true,
    };

  const driver =
    order.status === "DISPATCHED" ||
    order.status === "OUT_FOR_DELIVERY" ||
    order.status === "DELIVERED"
      ? DRIVER_TEMPLATES[hashString(order.id) % DRIVER_TEMPLATES.length]
      : undefined;

  return {
    ...order,
    products: buildOrderProducts(order),
    timeline: buildOrderTimeline(order),
    deliveryAddress,
    hub: hub ?? hubs[0],
    executive: executive ?? executives[0],
    driver,
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
  addresses: CustomerDeliveryAddress[] = CUSTOMER_ADDRESSES_SEED,
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
  const deliveryAddresses = getCustomerAddresses(customer.id, addresses);

  return {
    ...enriched,
    orders: customerOrders,
    deliveryAddresses,
    serviceHub: enriched.assignedOperations.isAssigned
      ? enriched.assignedOperations.hubName
      : getNearestHub(customer.address.city, customer.address.state, hubs).name,
  };
}

export function buildCustomerActivityTimeline(
  customer: CustomerListItem,
): CustomerActivityEvent[] {
  const events: CustomerActivityEvent[] = [
    {
      type: "REGISTERED",
      label: "Customer Registered",
      date: customer.activity.registeredAt,
      description: "Customer account created on the platform.",
      user: "System",
    },
  ];

  if (customer.activity.kycVerifiedAt) {
    events.push({
      type: "KYC_VERIFIED",
      label: "KYC Verified",
      date: customer.activity.kycVerifiedAt,
      description: "Identity verification completed.",
      user: "Compliance Team",
    });
  }

  if (customer.activity.firstLoginAt) {
    events.push({
      type: "FIRST_LOGIN",
      label: "First Login",
      date: customer.activity.firstLoginAt,
      description: "Customer opened the mobile app for the first time.",
      user: customer.name,
    });
  }

  if (customer.activity.firstOrderAt) {
    events.push({
      type: "FIRST_ORDER",
      label: "First Order",
      date: customer.activity.firstOrderAt,
      description: "First order placed on the platform.",
      user: customer.name,
    });
  }

  if (customer.activity.executiveAssignedAt) {
    events.push({
      type: "EXECUTIVE_ASSIGNED",
      label: "Executive Assigned",
      date: customer.activity.executiveAssignedAt,
      description: `Assigned to ${customer.assignedExecutive} at ${customer.assignedHub}.`,
      user: "System",
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
      user: customer.name,
    });
  }

  if (customer.activity.profileUpdatedAt) {
    events.push({
      type: "PROFILE_UPDATED",
      label: "Profile Updated",
      date: customer.activity.profileUpdatedAt,
      description: "Customer profile details were updated by admin.",
      user: "Admin",
    });
  }

  return events.sort((left, right) => left.date.localeCompare(right.date));
}

export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

export function applyCustomerEdit(
  customer: CustomerRecord,
  payload: CustomerEditPayload,
): CustomerRecord {
  return {
    ...customer,
    ...payload,
    address: { ...payload.address },
    activity: {
      ...customer.activity,
      profileUpdatedAt: new Date().toISOString(),
    },
  };
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
  CUSTOMER_ADDRESSES_SEED,
  CUSTOMER_HUBS,
  CUSTOMER_EXECUTIVES,
};
