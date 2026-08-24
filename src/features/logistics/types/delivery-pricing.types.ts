export type DeliveryVehicleType =
  | "BIKE"
  | "E_LOADER"
  | "THREE_WHEELER_LOADER"
  | "PICK_UP_VAN"
  | "FULL_TRUCK"
  | "HEAVY_LOADER"
  | "RMC_TRANSIT_MIXER";

export type DeliveryPricingStatus = "ACTIVE" | "INACTIVE";

export const DELIVERY_VEHICLE_OPTIONS: Array<{
  value: DeliveryVehicleType;
  label: string;
}> = [
  { value: "BIKE", label: "Bike" },
  { value: "E_LOADER", label: "E-Loader" },
  { value: "THREE_WHEELER_LOADER", label: "3 Wheeler Loader" },
  { value: "PICK_UP_VAN", label: "Pick Up Van" },
  { value: "FULL_TRUCK", label: "Full Truck" },
  { value: "HEAVY_LOADER", label: "600 sqft Loader" },
  { value: "RMC_TRANSIT_MIXER", label: "RMC Transit Mixer" },
];

export interface DeliveryPricingRule {
  id: string;
  vehicleType: DeliveryVehicleType;
  vehicleDisplayName: string;
  distanceFromKm: number;
  distanceToKm: number;
  distanceSlab: string;
  price: number;
  currency: string;
  status: DeliveryPricingStatus;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPricingSummary {
  activeVehicles: number;
  activePricingRules: number;
  freeBikeDeliveries: number;
  companyAbsorptionInr: number;
  benefitStatus: DeliveryPricingStatus;
  lastUpdated: string | null;
  totalRules: number;
}

export interface DeliveryBenefitConfig {
  id: string;
  configKey: string;
  firstBikeDeliveriesFree: number;
  companyAbsorptionInr: number;
  status: DeliveryPricingStatus;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedAt: string;
}

export interface DeliveryPricingHistoryEntry {
  id: string;
  ruleId: string;
  vehicleType: DeliveryVehicleType;
  vehicleDisplayName: string;
  previousPrice: number;
  newPrice: number;
  previousDistanceSlab: string;
  newDistanceSlab: string;
  previousStatus: DeliveryPricingStatus | null;
  newStatus: DeliveryPricingStatus | null;
  reason: string | null;
  updatedBy: string | null;
  updatedByName: string;
  createdAt: string;
}

export interface UpsertDeliveryPricingPayload {
  vehicleType?: DeliveryVehicleType;
  distanceFromKm: number;
  distanceToKm: number;
  price: number;
  status?: DeliveryPricingStatus;
  reason?: string;
}

export interface DeliveryVehicleConfig {
  id: string;
  vehicleType: DeliveryVehicleType;
  displayName: string;
  imageUrl: string | null;
  maxWeightKg: number | null;
  maxVolumeCft: number | null;
  maxQuantity: number | null;
  capacityUtilizationLimit: number;
  usableWeightKg: number | null;
  usableVolumeCft: number | null;
  usableQuantity: number | null;
  priority: number;
  active: boolean;
  hasConfiguredCapacity: boolean;
  allowedProductCategories: string[] | null;
  supportsRmc?: boolean;
  avgLoadingTimeMinutes?: number | null;
  avgUnloadingTimeMinutes?: number | null;
  driverPreparationTimeMinutes?: number | null;
  operationalBufferMinutes?: number | null;
  avgSpeedKmh?: number | null;
  supportsBulkMaterial?: boolean;
  allowedLogisticsTypes?: string[] | null;
}

export interface DeliveryEngineConfig {
  id: string;
  configKey: string;
  multiVehicleMode: "AUTO_SPLIT" | "BULK_QUOTE" | "REJECT";
  enablePartialDelivery: boolean;
  qtyTierFallbackEnabled: boolean;
  bulkOrderThresholdKg: number | null;
  bulkOrderThresholdCft: number | null;
  bulkOrderThresholdQty: number | null;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedAt: string;
}

export interface DeliveryEtaConfig {
  defaultPickingMinutes: number;
  defaultPackingMinutes: number;
  defaultQueueMinutes: number;
  defaultSiteAccessMinutes: number;
  trafficMultiplier: number;
  trafficDataAvailable: boolean;
  fallbackSpeedKmh: number;
  rmcPlantPreparationMinutes: number;
  rmcMixerLoadingMinutes: number;
  rmcPouringMinutesPerCum: number;
  rmcSiteAccessMinutes: number;
  rmcQueueMinutes: number;
  confidenceHighSpreadMinutes: number;
  confidenceMediumSpreadMinutes: number;
  confidenceLowSpreadMinutes: number;
}

export interface UpdateDeliveryVehicleConfigPayload {
  displayName?: string;
  imageUrl?: string | null;
  maxWeightKg?: number | null;
  maxVolumeCft?: number | null;
  maxQuantity?: number | null;
  capacityUtilizationLimit?: number;
  priority?: number;
  active?: boolean;
  avgLoadingTimeMinutes?: number | null;
  avgUnloadingTimeMinutes?: number | null;
  driverPreparationTimeMinutes?: number | null;
  operationalBufferMinutes?: number | null;
  avgSpeedKmh?: number | null;
  supportsRmc?: boolean;
  supportsBulkMaterial?: boolean;
  allowedLogisticsTypes?: string[] | null;
}
