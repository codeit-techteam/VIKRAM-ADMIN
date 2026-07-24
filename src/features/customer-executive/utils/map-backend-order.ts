import type {
  CeOrder,
  CeOrderItem,
  DeliveryPriority,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  TrackingStep,
} from "@/features/customer-executive/types";

type BackendOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HUB_ASSIGNED"
  | "AWAITING_HUB_ALLOCATION"
  | "PROCESSING"
  | "PACKED"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface BackendAdminOrder {
  id: string;
  orderNumber: string;
  orderStatus?: BackendOrderStatus;
  status?: BackendOrderStatus;
  grandTotal?: number | string;
  amount?: number | string;
  createdAt: string;
  paymentMethod?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
    address?: string;
  } | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
  } | null;
  customer?: {
    id?: string;
    fullName?: string | null;
    phone?: string;
  } | null;
  customerId?: string;
  hub?: { id?: string; code?: string; name?: string } | null;
  hubId?: string;
  assignedDriver?: {
    id?: string;
    name?: string;
    phone?: string;
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
  }>;
  isEmergency?: boolean;
  priorityOrder?: boolean;
  timeline?: Array<{ status?: string }>;
}

function mapStatus(status?: string): OrderStatus {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "DISPATCHED":
      return "IN_TRANSIT";
    case "PROCESSING":
    case "PACKED":
    case "READY_FOR_DISPATCH":
      return "HUB_PROCESSING";
    default:
      return "ACTIVE";
  }
}

function mapTrackingStep(status?: string): TrackingStep {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "DELIVERED";
    case "DISPATCHED":
      return "IN_TRANSIT";
    case "READY_FOR_DISPATCH":
      return "DISPATCHED";
    case "PACKED":
      return "PACKED";
    case "PROCESSING":
      return "ACCEPTED";
    default:
      return "ORDER_CREATED";
  }
}

function mapPaymentMethod(method?: string): PaymentMethod {
  const value = (method || "CASH").toUpperCase();
  if (value === "CASH") return "CASH";
  if (value === "UPI") return "UPI";
  if (value === "BANK") return "BANK";
  return "CASH";
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

export function mapBackendOrderToCeOrder(order: BackendAdminOrder): CeOrder {
  const status = mapStatus(order.orderStatus ?? order.status);
  const address = order.deliveryAddress ?? order.address;
  const deliveryAddress =
    [address?.line1 ?? address?.address, address?.line2, address?.city]
      .filter(Boolean)
      .join(", ") || "Delivery address";

  const priority: DeliveryPriority = order.isEmergency
    ? "EMERGENCY"
    : order.priorityOrder
      ? "EXPRESS"
      : "STANDARD";

  const source: OrderSource = "APP";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customer?.id || order.customerId || "",
    customerName: order.customer?.fullName || "Customer",
    company: order.customer?.fullName || "—",
    items: mapItems(order),
    amount: Number(order.grandTotal ?? order.amount ?? 0),
    status,
    orderSource: source,
    createdAt: order.createdAt,
    deliveryAddress,
    deliveryPincode: address?.pincode || "",
    deliveryPriority: priority,
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    trackingStep: mapTrackingStep(order.orderStatus ?? order.status),
    driverId: order.assignedDriver?.id || order.assignedDriverId,
    vehicleId: order.assignedVehicle?.id || order.assignedVehicleId,
    hubId: order.hub?.id || order.hubId || "",
    hubName: order.hub?.name,
    hubCode: order.hub?.code,
    managerName: order.manager?.fullName,
    driverName: order.assignedDriver?.name,
    driverPhone: order.assignedDriver?.phone,
    vehicleNumber: order.assignedVehicle?.registration,
  };
}
