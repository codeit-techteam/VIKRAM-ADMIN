export type HubTransferPriority = "low" | "medium" | "high" | "critical";

export type HubTransferStatus =
  | "PENDING_DISPATCH"
  | "VEHICLE_ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "PACKED"
  | "LOADED"
  | "DISPATCHED"
  | "REACHED_CUSTOMER_AREA"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type HubTransferTimelineKey =
  | "ORDER_ACCEPTED"
  | "INVENTORY_RESERVED"
  | "VEHICLE_ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "PACKED"
  | "LOADED"
  | "DISPATCHED"
  | "REACHED_CUSTOMER_AREA"
  | "DELIVERED"
  | "COMPLETED";

export interface HubTransferProduct {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  weightKg: number;
  unitPrice: number;
  amount: number;
}

export interface HubTransferTimelineEvent {
  id: string;
  key: HubTransferTimelineKey;
  title: string;
  updatedBy: string;
  timestamp: string;
  remarks?: string;
  completed: boolean;
}

export interface HubTransferFleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  assignedHub: string;
  currentTrips: number;
  status: "available" | "assigned" | "running" | "maintenance";
}

export interface HubTransferFleetDriver {
  id: string;
  name: string;
  mobile: string;
  employeeId: string;
  assignedHub: string;
  licenseExpiry: string;
  licenseStatus: "valid" | "expiring" | "expired";
  availability: "available" | "on_trip" | "on_leave";
  tripsToday: number;
}

export interface HubTransfer {
  id: string;
  transferId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  pincode: string;
  orderValue: number;
  orderDate: string;
  hubId: string;
  hubName: string;
  hubManager: string;
  dispatchCounter: string;
  reservedInventoryLabel: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  vehicleCapacityKg: number | null;
  driverId: string | null;
  driverName: string | null;
  driverMobile: string | null;
  licenseStatus: "valid" | "expiring" | "expired" | null;
  dispatchTime: string | null;
  expectedDelivery: string;
  estimatedArrival: string | null;
  status: HubTransferStatus;
  priority: HubTransferPriority;
  isDelayed: boolean;
  products: HubTransferProduct[];
  totalWeightKg: number;
  totalAmount: number;
  timeline: HubTransferTimelineEvent[];
  createdAt: string;
}

export interface HubTransferFilters {
  hubId: string;
  customer: string;
  orderId: string;
  driver: string;
  vehicle: string;
  status: HubTransferStatus | "all";
  dateFrom: string;
  dateTo: string;
  priority: HubTransferPriority | "all";
}

export interface HubTransferStats {
  todaysDispatches: number;
  pendingVehicleAssignment: number;
  inTransit: number;
  deliveredToday: number;
  delayedDeliveries: number;
}

export interface HubTransferQueryParams {
  page?: number;
  limit?: number;
  filters?: Partial<HubTransferFilters>;
  search?: string;
}

export interface HubTransferStatusUpdatePayload {
  status: HubTransferStatus;
  remarks: string;
  estimatedArrival?: string;
  updatedBy: string;
}
