export type LogisticsPriority = "low" | "medium" | "high" | "critical";

export type WarehouseShipmentStatus =
  | "pending"
  | "assigned"
  | "loading"
  | "dispatched"
  | "in_transit"
  | "reached_hub"
  | "completed"
  | "delayed";

export type CustomerDeliveryStatus =
  | "packed"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled"
  | "returned";

export type VehicleStatus =
  "available" | "assigned" | "loading" | "running" | "maintenance" | "inactive";

export type DriverStatus = "available" | "driving" | "on_leave" | "inactive";

export type DispatchStatus =
  | "pending"
  | "assigned"
  | "dispatched"
  | "in_transit"
  | "completed"
  | "cancelled";

export type MaintenanceStatus =
  "scheduled" | "in_maintenance" | "completed" | "overdue";

export type ShipmentType = "warehouse_transfer" | "customer_delivery";

export type ShipmentIssue =
  | "vehicle_breakdown"
  | "traffic_delay"
  | "driver_unreachable"
  | "document_missing"
  | "wrong_route"
  | "none";

export type TimelineStage =
  | "shipment_created"
  | "vehicle_assigned"
  | "driver_assigned"
  | "loading"
  | "dispatched"
  | "checkpoint"
  | "reached_hub"
  | "completed";

export interface FleetDocumentMeta {
  name: string;
  size: number;
  previewUrl?: string;
  uploadedAt: string;
}

export interface FleetVehicleDocuments {
  rc?: FleetDocumentMeta | null;
  insurance?: FleetDocumentMeta | null;
  fitness?: FleetDocumentMeta | null;
}

export interface FleetDriverDocuments {
  drivingLicense?: FleetDocumentMeta | null;
  aadhaar?: FleetDocumentMeta | null;
  pan?: FleetDocumentMeta | null;
  policeVerification?: FleetDocumentMeta | null;
  medicalCertificate?: FleetDocumentMeta | null;
  profilePhoto?: FleetDocumentMeta | null;
}

export interface FleetBankingDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
}

export interface FleetTimelineEvent {
  id: string;
  label: string;
  description?: string;
  timestamp: string;
  type: "info" | "success" | "warning";
}

export interface LogisticsVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  capacityLabel?: string;
  assignedWarehouse: string;
  assignedHub: string;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  currentShipmentId: string | null;
  fuelType: string;
  manufacturer?: string;
  model?: string;
  yearOfManufacture?: number;
  registrationDate: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry?: string;
  permitType?: string;
  permitExpiry?: string;
  currentOdometer?: number;
  gpsInstalled?: boolean;
  fastagNumber?: string;
  vehicleColor?: string;
  emergencyContact?: string;
  remarks?: string;
  lastMaintenanceDate?: string;
  photoUrl?: string | null;
  documents?: FleetVehicleDocuments;
  timeline?: FleetTimelineEvent[];
  status: VehicleStatus;
}

export interface LogisticsDriver {
  id: string;
  photoUrl: string | null;
  name: string;
  employeeId: string;
  mobile: string;
  alternatePhone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  licenseNumber: string;
  licenseIssueDate?: string;
  licenseExpiry: string;
  licenseType?: string;
  licenseIssuingState?: string;
  joiningDate?: string;
  employmentType?: string;
  shift?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  banking?: FleetBankingDetails;
  remarks?: string;
  assignedHub: string;
  assignedWarehouse: string;
  assignedVehicleId: string | null;
  assignedVehicleNumber: string | null;
  tripsToday: number;
  tripsCompleted?: number;
  documents?: FleetDriverDocuments;
  timeline?: FleetTimelineEvent[];
  status: DriverStatus;
}

export interface WarehouseShipment {
  id: string;
  shipmentId: string;
  warehouse: string;
  destinationHub: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  driverId: string | null;
  driverName: string | null;
  dispatchTime: string | null;
  eta: string;
  priority: LogisticsPriority;
  status: WarehouseShipmentStatus;
  isDelayed: boolean;
  createdAt: string;
}

export interface CustomerDelivery {
  id: string;
  orderId: string;
  customer: string;
  customerPhone: string;
  hub: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  driverId: string | null;
  driverName: string | null;
  deliveryEta: string;
  status: CustomerDeliveryStatus;
  address: string;
  createdAt: string;
}

export interface CriticalShipment {
  id: string;
  shipmentId: string;
  shipmentType: ShipmentType;
  source: string;
  destination: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  driverId: string | null;
  driverName: string | null;
  eta: string;
  issue: ShipmentIssue;
  priority: LogisticsPriority;
  status: string;
}

export interface DispatchRecord {
  id: string;
  dispatchId: string;
  source: string;
  destination: string;
  vehicleId: string | null;
  vehicleNumber: string | null;
  driverId: string | null;
  driverName: string | null;
  route: string;
  eta: string;
  status: DispatchStatus;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  issue: string;
  garage: string;
  expectedCompletion: string;
  status: MaintenanceStatus;
  scheduledDate: string;
}

export interface ShipmentTimeline {
  shipmentId: string;
  shipmentType: ShipmentType;
  currentStage: TimelineStage;
  stages: Array<{
    stage: TimelineStage;
    label: string;
    completedAt: string | null;
    isCurrent: boolean;
  }>;
  vehicleNumber: string | null;
  driverName: string | null;
  source: string;
  destination: string;
  eta: string;
  delayMinutes: number;
  remarks: string;
}

export interface LogisticsDashboardStats {
  warehouseTransfers: number;
  hubDeliveries: number;
  vehiclesRunning: number;
  driversActive: number;
  delayedShipments: number;
  todaysDeliveries: number;
  warehouseHub: {
    inTransit: number;
    pendingDispatch: number;
    delayed: number;
    completed: number;
  };
  hubCustomer: {
    readyForDelivery: number;
    outForDelivery: number;
    delivered: number;
    failedDelivery: number;
    returned: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WarehouseShipmentFilters {
  search: string;
  warehouse: string;
  destinationHub: string;
  priority: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface CustomerDeliveryFilters {
  search: string;
  hub: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface VehicleFilters {
  search: string;
  status: string;
  warehouse: string;
  hub: string;
}

export interface DriverFilters {
  search: string;
  status: string;
  hub: string;
}

export interface DispatchFilters {
  search: string;
  status: string;
  source: string;
  assignment: "all" | "needs_driver" | "needs_vehicle";
}

export interface MaintenanceFilters {
  search: string;
  status: string;
}
