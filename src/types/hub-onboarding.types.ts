export type HubType =
  | "regional-hub"
  | "distribution-center"
  | "dark-store"
  | "micro-hub"
  | "cross-dock";

export type HubCapacityTier = "small" | "medium" | "large" | "custom";

export type FulfillmentPriority = "P1" | "P2" | "P3";

export type ManagerPermission =
  | "orders"
  | "inventory"
  | "dispatch"
  | "drivers"
  | "reports"
  | "payments"
  | "requisitions";

export type DeliverySlot = "morning" | "afternoon" | "evening" | "night";

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type HubManagerMode = "existing" | "create";

export interface HubInventorySkuDraft {
  id: string;
  materialId: string;
  sku: string;
  category: string;
  productName: string;
  variant: string;
  unit: string;
  openingStock: number;
  reorderLevel: number;
  safetyStock: number;
  maxStock: number;
  selected: boolean;
}

export interface HubWarehouseContact {
  id: string;
  name: string;
  role: string;
  availability: "on-duty" | "off-duty";
  phone?: string;
}

export interface HubDriverDraft {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  avatarInitials: string;
}

export interface HubVehicleDraft {
  id: string;
  vehicleType: string;
  regNumber: string;
  status: "active" | "idle" | "maintenance";
}

export interface HubDraftBasic {
  hubName: string;
  hubCode: string;
  hubType: HubType;
  capacityTier: HubCapacityTier;
  customCapacityMt: number;
  openingDate: string;
  isActive: boolean;
  state: string;
  city: string;
  pincode: string;
  detailedAddress: string;
  coverageRadiusKm: number;
  linkedWarehouseId: string;
  linkedWarehouseName: string;
  fulfillmentPriority: FulfillmentPriority;
  workingDays: WeekDay[];
  shiftStart: string;
  shiftEnd: string;
}

export interface HubDraftInventory {
  skus: HubInventorySkuDraft[];
}

export interface HubDraftWarehouse {
  warehouseId: string;
  warehouseName: string;
  distanceKm: number;
  transferTimeMins: number;
  priority: "Tier 1" | "Tier 2" | "Tier 3";
  autoRestocking: boolean;
  restockThresholdPercent: number;
  emergencyReplenishment: boolean;
  allowedCategories: string[];
  contacts: HubWarehouseContact[];
}

export interface HubDraftManager {
  mode: HubManagerMode;
  existingManagerId: string;
  fullName: string;
  employeeId: string;
  phone: string;
  email: string;
  permissions: ManagerPermission[];
  credentialsGenerated: boolean;
  sendWhatsAppWelcome: boolean;
}

export interface HubDraftFleet {
  drivers: HubDriverDraft[];
  vehicles: HubVehicleDraft[];
  deliverySlots: DeliverySlot[];
}

export interface HubDraftCoverage {
  radiusKm: number;
  mode: "radius" | "polygon" | "pincode";
  pincodes: string[];
  polygonPoints: Array<{ x: number; y: number }>;
  estimatedCustomers: number;
  nearbyHubs: number;
  nearbyHubLabel: string;
  conflictPercent: number;
  conflictHubName: string;
  avgTransitMins: number;
  peakDelayMins: number;
  fuelEfficiency: "high" | "medium" | "low";
}

export interface HubDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  assignee: string;
  basic: HubDraftBasic;
  inventory: HubDraftInventory;
  warehouse: HubDraftWarehouse;
  manager: HubDraftManager;
  fleet: HubDraftFleet;
  coverage: HubDraftCoverage;
}

export interface HubWizardStep {
  id: number;
  label: string;
  shortLabel: string;
}

export interface CreateHubResult {
  hubId: string;
  hubCode: string;
  hubName: string;
}
