import type {
  AdminCustomerDetail,
  AdminCustomerListItem,
} from "@/services/customers";
import type {
  CustomerActivityEvent,
  CustomerDetail,
  CustomerListItem,
  CustomerOrder,
  CustomerOrderStatus,
  CustomerStatus,
  CustomerType,
} from "@/features/user-management/types/customer.types";

/** Backend customer status -> UI status. */
export function mapApiStatusToUiStatus(
  status: string,
  isVerified?: boolean,
): CustomerStatus {
  switch (status) {
    case "SUSPENDED":
      return "BLOCKED";
    case "INACTIVE":
      return "INACTIVE";
    case "ACTIVE":
      return isVerified === false ? "PENDING_VERIFICATION" : "ACTIVE";
    default:
      return isVerified === false ? "PENDING_VERIFICATION" : "INACTIVE";
  }
}

/** UI status -> backend list/write status. */
export function mapUiStatusToApiStatus(
  status: string,
): "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | undefined {
  switch (status) {
    case "ACTIVE":
      return "ACTIVE";
    case "INACTIVE":
      return "INACTIVE";
    case "BLOCKED":
      return "SUSPENDED";
    case "PENDING_VERIFICATION":
      return "PENDING_VERIFICATION";
    default:
      return undefined;
  }
}

function mapBusinessTypeToCustomerType(
  businessType?: string | null,
): CustomerType {
  const value = (businessType ?? "").toUpperCase();
  if (value.includes("BUILDER")) return "BUILDER";
  if (value.includes("INTERIOR")) return "INTERIOR_DESIGNER";
  if (value.includes("INDIVIDUAL")) return "INDIVIDUAL";
  return "CONTRACTOR";
}

function mapOrderStatus(status: string): CustomerOrderStatus {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "CONFIRMED":
    case "HUB_ASSIGNED":
    case "AWAITING_HUB_ALLOCATION":
    case "ACCEPTED_BY_HUB":
    case "PICKING":
    case "PROCESSING":
      return "PROCESSING";
    case "PACKED":
    case "READY_FOR_DISPATCH":
      return "PACKED";
    case "DRIVER_ASSIGNED":
    case "DISPATCHED":
      return "DISPATCHED";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapOrders(
  customerId: string,
  orders: AdminCustomerDetail["orders"] | undefined,
): CustomerOrder[] {
  if (!Array.isArray(orders)) return [];

  return orders.map((raw) => {
    const order = raw as Record<string, unknown>;
    const id = String(order.id ?? "");
    const status = mapOrderStatus(String(order.orderStatus ?? "PENDING"));
    const createdAt = String(order.createdAt ?? new Date().toISOString());

    const hub =
      order.hub && typeof order.hub === "object"
        ? (order.hub as { id?: unknown; name?: unknown })
        : null;

    return {
      id,
      orderId: String(order.orderNumber ?? id),
      customerId,
      date: createdAt,
      hubId: hub?.id ? String(hub.id) : order.hubId ? String(order.hubId) : "",
      hubName: hub?.name ? String(hub.name) : undefined,
      status,
      amount: toNumber(order.grandTotal),
      orderSource: "CUSTOMER_APP",
    };
  });
}

function buildOrderSummary(orders: CustomerOrder[]) {
  const activeStatuses = new Set([
    "PENDING",
    "PROCESSING",
    "PACKED",
    "DISPATCHED",
    "OUT_FOR_DELIVERY",
  ]);

  return {
    totalOrders: orders.length,
    activeOrders: orders.filter((o) => activeStatuses.has(o.status)).length,
    deliveredOrders: orders.filter((o) => o.status === "DELIVERED").length,
    cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
    lastOrderDate: orders[0]?.date ?? null,
  };
}

function defaultAddressFromDetail(detail: AdminCustomerDetail) {
  const primary =
    detail.addresses?.find((a) => a.isDefault) ?? detail.addresses?.[0];
  const registered = detail.profile?.registeredAddress;

  return {
    primaryAddress:
      primary?.line1 ?? registered ?? detail.profile?.companyName ?? "",
    city: primary?.city ?? "",
    state: primary?.state ?? "",
    pincode: primary?.pincode ?? "",
  };
}

export function mapAdminCustomerToListItem(
  row: AdminCustomerListItem,
): CustomerListItem {
  const status = mapApiStatusToUiStatus(row.status, row.isVerified);
  const name = row.name?.trim() || row.phone;
  const hubName = row.assignedHubName?.trim() || "Not assigned";
  const executiveName = row.assignedExecutiveName?.trim() || "Not assigned";

  return {
    id: row.id,
    customerId: row.id,
    name,
    phone: row.phone,
    email: row.email ?? "",
    customerType: mapBusinessTypeToCustomerType(row.customerType),
    status,
    kycStatus: row.gst ? "VERIFIED" : "PENDING",
    registrationDate: row.createdAt,
    address: {
      primaryAddress: row.company ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      pincode: "",
    },
    activity: {
      registeredAt: row.createdAt,
      firstLoginAt: row.lastLogin ?? undefined,
      latestOrderAt: row.lastLogin ?? undefined,
    },
    assignedHub: hubName,
    assignedExecutive: executiveName,
    activeOrders: row.orders,
    lastOrderDate: null,
    assignedOperations: {
      hubId: row.assignedHubId ?? undefined,
      hubName,
      executiveId: row.assignedExecutiveId ?? undefined,
      executiveName,
      isAssigned: Boolean(row.assignedHubId || row.assignedExecutiveId),
    },
    orderSummary: {
      totalOrders: row.orders,
      activeOrders: row.orders,
      deliveredOrders: 0,
      cancelledOrders: 0,
      lastOrderDate: null,
    },
    company: row.company ?? undefined,
    gst: row.gst ?? undefined,
    lastLogin: row.lastLogin ?? undefined,
    walletBalance: row.wallet?.balance ?? row.loyaltyPoints,
  };
}

export function mapAdminCustomerToDetail(
  detail: AdminCustomerDetail,
): CustomerDetail {
  const listBase = mapAdminCustomerToListItem({
    id: detail.id,
    name: detail.name,
    phone: detail.phone,
    email: detail.email,
    company: detail.profile?.companyName ?? null,
    gst: detail.profile?.gstNumber ?? null,
    customerType: detail.profile?.businessType ?? null,
    isVerified: detail.isVerified,
    city: detail.addresses?.find((a) => a.isDefault)?.city ?? detail.addresses?.[0]?.city ?? null,
    state: detail.addresses?.find((a) => a.isDefault)?.state ?? detail.addresses?.[0]?.state ?? null,
    status: detail.status,
    createdAt: detail.createdAt,
    lastLogin: detail.lastLogin,
    orders: Array.isArray(detail.orders) ? detail.orders.length : 0,
    wallet: {
      balance: detail.loyalty?.availablePoints ?? 0,
    },
    addresses: detail.addresses?.length ?? 0,
    assignedHubId: detail.assignedHubId ?? null,
    assignedHubName: detail.assignedHubName ?? null,
    assignedExecutiveId: detail.assignedExecutiveId ?? null,
    assignedExecutiveName: detail.assignedExecutiveName ?? null,
  });

  const orders = mapOrders(detail.id, detail.orders);
  const orderSummary =
    orders.length > 0
      ? buildOrderSummary(orders)
      : {
          ...listBase.orderSummary,
          totalOrders: listBase.orderSummary.totalOrders,
        };

  const address = defaultAddressFromDetail(detail);
  const hubName = detail.assignedHubName ?? "Not available";
  const executiveName = detail.assignedExecutiveName ?? "Not available";

  return {
    ...listBase,
    name: detail.name?.trim() || detail.phone,
    customerType: mapBusinessTypeToCustomerType(detail.profile?.businessType),
    address,
    company: detail.profile?.companyName ?? undefined,
    gst: detail.profile?.gstNumber ?? undefined,
    designation: detail.profile?.businessType ?? undefined,
    imageUrl: undefined,
    orders,
    orderSummary,
    serviceHub: hubName,
    deliveryAddresses: (detail.addresses ?? []).map((addr) => ({
      id: addr.id,
      customerId: detail.id,
      recipient: detail.name?.trim() || detail.phone,
      phone: detail.phone,
      address: [addr.line1, addr.line2].filter(Boolean).join(", "),
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      serviceHubId: detail.assignedHubId ?? "",
      serviceHubName: hubName,
      isDefault: addr.isDefault,
    })),
    assignedHub: hubName,
    assignedExecutive: executiveName,
    assignedOperations: {
      hubId: detail.assignedHubId ?? undefined,
      hubName,
      executiveId: detail.assignedExecutiveId ?? undefined,
      executiveName,
      isAssigned: Boolean(detail.assignedHubId || detail.assignedExecutiveId),
    },
    supportExecutiveAssignment: detail.assignedExecutiveId
      ? {
          executiveId: detail.assignedExecutiveId,
          executiveName:
            executiveName === "Not available" ? "—" : executiveName,
          employeeId: "Not available",
          hubId: detail.assignedHubId ?? "",
          hubName: hubName === "Not available" ? "Not assigned" : hubName,
          phone: detail.assignedExecutivePhone ?? "Not available",
          email: detail.assignedExecutiveEmail ?? "Not available",
          reason: "CUSTOMER_SUPPORT",
          priority: "MEDIUM",
          assignedDate: detail.updatedAt ?? detail.createdAt,
          assignedBy: "Super Admin",
        }
      : undefined,
  };
}

export function buildCustomerTimelineFromDetail(
  detail: AdminCustomerDetail,
  customer: CustomerDetail,
): CustomerActivityEvent[] {
  const events: CustomerActivityEvent[] = [
    {
      type: "REGISTERED",
      label: "Customer registered",
      date: customer.registrationDate,
      description: "Account created",
    },
  ];

  if (customer.lastLogin) {
    events.push({
      type: "FIRST_LOGIN",
      label: "Last login",
      date: customer.lastLogin,
    });
  }

  if (detail.profile?.gstVerified) {
    events.push({
      type: "KYC_VERIFIED",
      label: "GST / KYC verified",
      date: customer.registrationDate,
    });
  }

  if (detail.assignedExecutiveId) {
    events.push({
      type: "EXECUTIVE_ASSIGNED",
      label: "Support executive assigned",
      date: detail.updatedAt ?? detail.createdAt,
      description: detail.assignedExecutiveName ?? undefined,
    });
  }

  const sortedOrders = [...customer.orders].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  if (sortedOrders[0]) {
    events.push({
      type: "FIRST_ORDER",
      label: `First order ${sortedOrders[0].orderId}`,
      date: sortedOrders[0].date,
      description: `₹${sortedOrders[0].amount.toLocaleString("en-IN")}`,
    });
  }

  const latest = sortedOrders[sortedOrders.length - 1];
  if (latest && sortedOrders.length > 1) {
    events.push({
      type: "LATEST_ORDER",
      label: `Latest order ${latest.orderId}`,
      date: latest.date,
      description: `${latest.status} · ₹${latest.amount.toLocaleString("en-IN")}`,
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
