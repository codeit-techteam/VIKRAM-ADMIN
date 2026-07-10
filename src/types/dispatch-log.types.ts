export type DispatchLogStatus =
  | "PACKED"
  | "READY"
  | "LOADED"
  | "DISPATCHED"
  | "REACHED_AREA"
  | "DELIVERED"
  | "COMPLETED";

export interface DispatchLogTimelineEvent {
  id: string;
  status: DispatchLogStatus;
  title: string;
  updatedBy: string;
  timestamp: string;
  remarks?: string;
  isManual: boolean;
}

export interface DispatchLogOrderLine {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface DispatchLog {
  id: string;
  dispatchId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  pincode: string;
  hubId: string;
  hubName: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  driverId: string | null;
  driverName: string | null;
  driverMobile: string | null;
  dispatchTime: string | null;
  expectedDelivery: string;
  status: DispatchLogStatus;
  isDelayed: boolean;
  lastUpdated: string;
  deliveryNotes: string;
  orderLines: DispatchLogOrderLine[];
  orderValue: number;
  timeline: DispatchLogTimelineEvent[];
  createdAt: string;
}

export interface DispatchLogFilters {
  hubId: string;
  customer: string;
  vehicle: string;
  driver: string;
  status: DispatchLogStatus | "all";
  date: string;
}

export interface DispatchLogStats {
  todaysDispatch: number;
  inProgress: number;
  delivered: number;
  delayed: number;
}

export interface DispatchLogQueryParams {
  page?: number;
  limit?: number;
  filters?: Partial<DispatchLogFilters>;
  search?: string;
}

export interface DispatchLogStatusUpdatePayload {
  status: DispatchLogStatus;
  remarks: string;
  updatedBy: string;
}
