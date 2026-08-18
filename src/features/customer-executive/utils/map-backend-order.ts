import type {
  CeOrder,
  CeOrderItem,
  CeOrderTimelineEntry,
  DeliveryPriority,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  TrackingStep,
} from "@/features/customer-executive/types";

type BackendOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HUB_ASSIGNED"
  | "AWAITING_HUB_ALLOCATION"
  | "ACCEPTED_BY_HUB"
  | "PICKING"
  | "PROCESSING"
  | "PACKED"
  | "READY_FOR_DISPATCH"
  | "DRIVER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface BackendAdminOrder {
  id: string;
  orderNumber: string;
  orderStatus?: BackendOrderStatus | string;
  status?: BackendOrderStatus | string;
  statusLabel?: string;
  grandTotal?: number | string;
  amount?: number | string;
  subtotal?: number | string;
  gstAmount?: number | string;
  deliveryCharge?: number | string;
  discountAmount?: number | string;
  loyaltyPointsUsed?: number;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  expectedDeliveryAt?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  orderAgeHours?: number | null;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    country?: string;
  } | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
  customer?: {
    id?: string;
    fullName?: string | null;
    phone?: string;
    profile?: {
      gstNumber?: string;
      companyName?: string;
    };
  } | null;
  customerId?: string;
  hub?: { id?: string; code?: string; name?: string } | null;
  hubId?: string;
  assignedDriver?: {
    id?: string;
    name?: string;
    phone?: string;
    vehicle?: { registration?: string; vehicleType?: string } | null;
  } | null;
  assignedDriverId?: string;
  assignedVehicle?: { id?: string; registration?: string } | null;
  assignedVehicleId?: string;
  manager?: { id?: string; fullName?: string } | null;
  items?: Array<{
    productId?: string;
    name?: string;
    product?: { name?: string };
    unit?: string;
    unitPrice?: number | string;
    quantity?: number;
    sku?: string;
    variant?: string;
    subtotal?: number | string;
  }>;
  isEmergency?: boolean;
  priorityOrder?: boolean;
  timeline?: Array<{
    id?: string;
    status?: string;
    statusLabel?: string;
    message?: string;
    remarks?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedByRole?: string;
  }>;
  tracking?: {
    currentStatus?: string;
    statusLabel?: string;
    hub?: { id?: string; name?: string; code?: string } | null;
    driver?: {
      id?: string;
      name?: string;
      phone?: string;
      vehicle?: string | null;
    } | null;
    lastUpdated?: string | null;
    expectedDelivery?: string | null;
    orderAgeHours?: number | null;
  };
  deliveryVerification?: {
    driverReached?: boolean;
    driverReachedAt?: string | null;
    otpGenerated?: boolean;
    otpGeneratedAt?: string | null;
    otpVerified?: boolean;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    delivered?: boolean;
    deliveredAt?: string | null;
    deliveryCompletedAt?: string | null;
    paymentCollectedAt?: string | null;
    driver?: { id?: string; name?: string; phone?: string } | null;
    vehicle?: { id?: string; registration?: string } | null;
    hub?: { id?: string; name?: string; code?: string } | null;
    verificationLink?: string;
  };
  driverReachedAt?: string | null;
  deliveryOtpGenerated?: boolean;
  deliveryOtpGeneratedAt?: string | null;
  deliveryOtpVerified?: boolean;
  deliveryVerifiedBy?: string | null;
  deliveryCompletedAt?: string | null;
  paymentCollectedAt?: string | null;
  deliveredAt?: string | null;
  routing?: {
    assignmentStatus?: "ASSIGNED" | "UNASSIGNED";
    assignmentReason?: string | null;
    assignmentReasonLabel?: string | null;
    snapshot?: {
      customerLatitude?: number | null;
      customerLongitude?: number | null;
      selectedHubName?: string | null;
      nearestHubName?: string | null;
      nearestDistanceKm?: number | null;
      nearestHubRadiusKm?: number | null;
      inCoverage?: boolean;
      reason?: string | null;
    } | null;
  };
}

/** Map canonical + legacy backend statuses → CE OrderStatus buckets. */
export function mapStatus(status?: string): OrderStatus {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "DRIVER_ASSIGNED":
    case "OUT_FOR_DELIVERY":
    case "DISPATCHED":
      return "IN_TRANSIT";
    case "ACCEPTED_BY_HUB":
    case "PICKING":
    case "PACKED":
    case "PROCESSING":
    case "READY_FOR_DISPATCH":
      return "HUB_PROCESSING";
    case "PENDING":
    case "CONFIRMED":
    case "HUB_ASSIGNED":
    case "AWAITING_HUB_ALLOCATION":
    default:
      return "ACTIVE";
  }
}

export function mapTrackingStep(status?: string): TrackingStep {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "DELIVERED";
    case "OUT_FOR_DELIVERY":
    case "DISPATCHED":
      return "OUT_FOR_DELIVERY";
    case "DRIVER_ASSIGNED":
      return "DRIVER_ASSIGNED";
    case "PACKED":
    case "READY_FOR_DISPATCH":
      return "PACKED";
    case "ACCEPTED_BY_HUB":
    case "PICKING":
    case "PROCESSING":
      return "ACCEPTED";
    case "HUB_ASSIGNED":
    case "AWAITING_HUB_ALLOCATION":
      return "ACCEPTED";
    case "CONFIRMED":
      return "PAYMENT_RECEIVED";
    case "CANCELLED":
      return "ORDER_CREATED";
    case "PENDING":
    default:
      return "ORDER_CREATED";
  }
}

function mapPaymentMethod(method?: string): PaymentMethod {
  const value = (method || "CASH").toUpperCase();
  if (value === "CASH") return "CASH";
  if (value === "UPI") return "UPI";
  if (value === "BANK") return "BANK";
  if (value === "CREDIT") return "CREDIT";
  return "CASH";
}

function mapPaymentStatus(status?: string): PaymentStatus | undefined {
  if (!status) return undefined;
  const value = status.toUpperCase();
  if (value === "PAID") return "PAID";
  if (value === "COLLECTED") return "COLLECTED";
  if (value === "PARTIAL") return "PARTIAL";
  if (value === "EXPIRED") return "EXPIRED";
  if (value === "PENDING") return "PENDING";
  return "PENDING";
}

function mapItems(order: BackendAdminOrder): CeOrderItem[] {
  if (!order.items?.length) {
    return [
      {
        productId: "unknown",
        productName: "Order items",
        sku: "—",
        unit: "unit",
        unitPrice: Number(order.grandTotal ?? order.amount ?? 0),
        quantity: 1,
      },
    ];
  }

  return order.items.map((item) => ({
    productId: item.productId || "unknown",
    productName: item.name || item.product?.name || "Product",
    sku: item.sku || (item.productId || "").slice(0, 8) || "—",
    unit: item.unit || "unit",
    unitPrice: Number(item.unitPrice ?? 0),
    quantity: Number(item.quantity ?? 1),
  }));
}

function mapTimeline(
  timeline?: BackendAdminOrder["timeline"],
): CeOrderTimelineEntry[] | undefined {
  if (!timeline?.length) return undefined;
  return timeline.map((entry) => ({
    id: entry.id,
    status: entry.status,
    statusLabel: entry.statusLabel,
    message: entry.message ?? entry.remarks,
    createdAt: entry.createdAt,
    updatedBy: entry.updatedBy,
    updatedByRole: entry.updatedByRole,
  }));
}

export function mapBackendOrderToCeOrder(order: BackendAdminOrder): CeOrder {
  const rawBackendStatus = String(
    order.orderStatus ?? order.status ?? order.tracking?.currentStatus ?? "",
  ).toUpperCase();
  const status = mapStatus(rawBackendStatus);
  const address = order.deliveryAddress ?? order.address;
  const deliveryAddress =
    [
      address?.line1 ??
        (address as { address?: string } | null | undefined)?.address,
      address?.line2,
      address?.city,
    ]
      .filter(Boolean)
      .join(", ") || "Delivery address";

  const priority: DeliveryPriority = order.isEmergency
    ? "EMERGENCY"
    : order.priorityOrder
      ? "EXPRESS"
      : "STANDARD";

  const source: OrderSource = "APP";
  const tracking = order.tracking;
  const driverFromTracking = tracking?.driver;
  const hubFromTracking = tracking?.hub;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customer?.id || order.customerId || "",
    customerName: order.customer?.fullName || "Customer",
    company: order.customer?.fullName || "—",
    items: mapItems(order),
    amount: Number(order.grandTotal ?? order.amount ?? 0),
    status,
    rawBackendStatus: rawBackendStatus || undefined,
    statusLabel: order.statusLabel ?? tracking?.statusLabel,
    orderSource: source,
    createdAt: order.createdAt,
    eta: tracking?.expectedDelivery ?? order.expectedDeliveryAt ?? undefined,
    deliveryAddress,
    deliveryPincode: address?.pincode || "",
    deliveryDate:
      tracking?.expectedDelivery ?? order.expectedDeliveryAt ?? undefined,
    deliveryPriority: priority,
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    trackingStep: mapTrackingStep(rawBackendStatus),
    driverId:
      order.assignedDriver?.id ||
      order.assignedDriverId ||
      driverFromTracking?.id,
    vehicleId: order.assignedVehicle?.id || order.assignedVehicleId,
    hubId: order.hub?.id || order.hubId || hubFromTracking?.id || "",
    hubName: order.hub?.name || hubFromTracking?.name,
    hubCode: order.hub?.code || hubFromTracking?.code,
    managerName: order.manager?.fullName,
    driverName: order.assignedDriver?.name || driverFromTracking?.name,
    driverPhone: order.assignedDriver?.phone || driverFromTracking?.phone,
    vehicleNumber:
      order.assignedVehicle?.registration ||
      order.assignedDriver?.vehicle?.registration ||
      driverFromTracking?.vehicle ||
      undefined,
    invoiceId: order.invoiceId ?? undefined,
    invoiceNumber: order.invoiceNumber ?? undefined,
    lastUpdated: tracking?.lastUpdated ?? order.updatedAt,
    expectedDelivery:
      tracking?.expectedDelivery ?? order.expectedDeliveryAt ?? undefined,
    orderAgeHours: tracking?.orderAgeHours ?? order.orderAgeHours ?? undefined,
    timeline: mapTimeline(order.timeline),
    deliveryVerification: order.deliveryVerification
      ? {
          driverReached: Boolean(order.deliveryVerification.driverReached),
          driverReachedAt: order.deliveryVerification.driverReachedAt,
          otpGenerated: Boolean(order.deliveryVerification.otpGenerated),
          otpGeneratedAt: order.deliveryVerification.otpGeneratedAt,
          otpVerified: Boolean(order.deliveryVerification.otpVerified),
          verifiedBy: order.deliveryVerification.verifiedBy,
          verifiedAt: order.deliveryVerification.verifiedAt,
          delivered: Boolean(order.deliveryVerification.delivered),
          deliveredAt: order.deliveryVerification.deliveredAt,
          deliveryCompletedAt: order.deliveryVerification.deliveryCompletedAt,
          paymentCollectedAt: order.deliveryVerification.paymentCollectedAt,
          driver: order.deliveryVerification.driver,
          vehicle: order.deliveryVerification.vehicle,
          hub: order.deliveryVerification.hub,
          verificationLink: order.deliveryVerification.verificationLink,
        }
      : undefined,
    routing: order.routing,
  };
}
