import type {
  HubDraft,
  HubInventorySkuDraft,
  HubType,
  HubWizardStep,
  WeekDay,
} from "@/types/hub-onboarding.types";

export const HUB_DRAFT_STORAGE_KEY = "bq-hub-wizard-draft";
export const HUB_DRAFT_SAVED_AT_KEY = "bq-hub-wizard-draft-saved-at";

/** Single warehouse for current phase — every hub links here automatically. */
export const MAIN_WAREHOUSE = {
  id: "wh-main-gurugram",
  name: "Main Warehouse Gurugram",
  distanceKm: 0,
  transferTimeMins: 0,
  priority: "Tier 1" as const,
  contacts: [
    {
      id: "wc-main-1",
      name: "Warehouse Ops",
      role: "Warehouse Manager",
      availability: "on-duty" as const,
      phone: "+91 98100 22001",
    },
  ],
} as const;

/** Default Hub Manager for current phase (editable in the wizard). */
export const DEFAULT_HUB_MANAGER = {
  fullName: "Rahul Sharma",
  phone: "9876543210",
  email: "rahul@company.com",
  employeeId: "rahul.sharma",
  username: "rahul.sharma",
  password: "Rahul@123",
} as const;

export const HUB_WIZARD_STEPS: HubWizardStep[] = [
  { id: 1, label: "Basic Information", shortLabel: "Basic Info" },
  { id: 2, label: "Inventory Configuration", shortLabel: "Inventory" },
  { id: 3, label: "Hub Manager", shortLabel: "Manager" },
  { id: 4, label: "Logistics Configuration", shortLabel: "Logistics" },
  { id: 5, label: "Service Area Coverage", shortLabel: "Coverage" },
  { id: 6, label: "Review & Create", shortLabel: "Review" },
];

export const HUB_TYPE_OPTIONS: Array<{ value: HubType; label: string }> = [
  { value: "regional-hub", label: "Regional Hub" },
  { value: "distribution-center", label: "Distribution Center" },
  { value: "dark-store", label: "Dark Store" },
  { value: "micro-hub", label: "Micro Hub" },
  { value: "cross-dock", label: "Cross Dock" },
];

export const HUB_CAPACITY_OPTIONS = [
  { value: "small" as const, label: "Small" },
  { value: "medium" as const, label: "Medium" },
  { value: "large" as const, label: "Large" },
  { value: "custom" as const, label: "Custom" },
];

export const CAPACITY_MT_BY_TIER = {
  small: 2000,
  medium: 4000,
  large: 6500,
  custom: 0,
} as const;

export const WEEK_DAYS: Array<{ value: WeekDay; label: string }> = [
  { value: "mon", label: "MON" },
  { value: "tue", label: "TUE" },
  { value: "wed", label: "WED" },
  { value: "thu", label: "THU" },
  { value: "fri", label: "FRI" },
  { value: "sat", label: "SAT" },
  { value: "sun", label: "SUN" },
];

export const INDIAN_STATES = [
  "New Delhi",
  "Haryana",
  "Uttar Pradesh",
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
] as const;

/** @deprecated Prefer MAIN_WAREHOUSE — multi-warehouse selection removed. */
export const HUB_WAREHOUSE_OPTIONS = [MAIN_WAREHOUSE] as const;

export const PRODUCT_CATEGORY_OPTIONS = [
  "Construction Materials",
  "Safety Gear",
  "Heavy Machinery",
  "Electricals",
  "Finishing",
  "Cementing Materials",
  "RMC",
  "Masonry & Blockwork",
  "Paints & Coatings",
] as const;

export const EXISTING_HUB_MANAGERS = [
  {
    id: "mgr-rahul",
    fullName: DEFAULT_HUB_MANAGER.fullName,
    employeeId: DEFAULT_HUB_MANAGER.employeeId,
    phone: DEFAULT_HUB_MANAGER.phone,
    email: DEFAULT_HUB_MANAGER.email,
  },
] as const;

export const MANAGER_PERMISSION_OPTIONS = [
  { value: "orders" as const, label: "Orders", icon: "shopping-cart" },
  { value: "inventory" as const, label: "Inventory", icon: "package" },
  { value: "dispatch" as const, label: "Dispatch", icon: "truck" },
  { value: "drivers" as const, label: "Drivers", icon: "id-card" },
  { value: "reports" as const, label: "Reports", icon: "chart" },
  { value: "payments" as const, label: "Payments", icon: "payments" },
  { value: "requisitions" as const, label: "Requisitions", icon: "clipboard" },
] as const;

export const DELIVERY_SLOT_OPTIONS = [
  { value: "morning" as const, label: "Morning", hint: "6 AM – 12 PM" },
  { value: "afternoon" as const, label: "Afternoon", hint: "12 PM – 4 PM" },
  { value: "evening" as const, label: "Evening", hint: "4 PM – 8 PM" },
  { value: "night" as const, label: "Night", hint: "8 PM – 12 AM" },
] as const;

const STATE_CODE_MAP: Record<string, string> = {
  "New Delhi": "DL",
  Haryana: "HR",
  "Uttar Pradesh": "UP",
  Rajasthan: "RJ",
  Maharashtra: "MH",
  Gujarat: "GJ",
  Karnataka: "KA",
  "Tamil Nadu": "TN",
  Telangana: "TS",
  "West Bengal": "WB",
};

const CITY_CODE_MAP: Record<string, string> = {
  kalyani: "KAL",
  noida: "NOI",
  kolkata: "KOL",
  delhi: "DEL",
  "new delhi": "DEL",
  gurugram: "GGN",
  gurgaon: "GGN",
  mumbai: "MUM",
  pune: "PUN",
  jaipur: "JAI",
  manesar: "MAN",
  faridabad: "FAR",
  bengaluru: "BLR",
  bangalore: "BLR",
  hyderabad: "HYD",
  chennai: "CHN",
  ahmedabad: "AMD",
};

export function getStateCode(state: string): string {
  return STATE_CODE_MAP[state] ?? "IN";
}

export function getCityCode(city: string, state: string): string {
  const key = city.trim().toLowerCase();
  if (CITY_CODE_MAP[key]) return CITY_CODE_MAP[key];
  const cleaned = city.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length >= 3) return cleaned.slice(0, 3);
  return getStateCode(state);
}

export function generateHubCode(
  state: string,
  existingCodes: string[],
  city = "",
): string {
  const cityCode = getCityCode(city, state);
  const prefix = `HUB-${cityCode}-`;
  let seq = 1;

  const used = new Set(
    existingCodes
      .filter((code) => code.startsWith(prefix))
      .map((code) => Number(code.replace(prefix, "")) || 0),
  );

  while (used.has(seq)) seq += 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export function usernameFromFullName(fullName: string): string {
  const parts = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "hub.manager";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[parts.length - 1]}`;
}

export function passwordFromFullName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] || "Hub";
  return `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}@123`;
}

export function buildDefaultInventorySkus(): HubInventorySkuDraft[] {
  return [];
}

export function createEmptyHubDraft(existingCodes: string[] = []): HubDraft {
  const now = new Date().toISOString();
  const warehouse = MAIN_WAREHOUSE;

  return {
    id: `draft-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    currentStep: 1,
    assignee: "",
    basic: {
      hubName: "",
      hubCode: generateHubCode("New Delhi", existingCodes, ""),
      hubType: "distribution-center",
      capacityTier: "small",
      customCapacityMt: 2500,
      openingDate: "",
      isActive: true,
      state: "New Delhi",
      city: "",
      pincode: "110001",
      detailedAddress: "",
      coverageRadiusKm: 15,
      linkedWarehouseId: warehouse.id,
      linkedWarehouseName: warehouse.name,
      fulfillmentPriority: "P1",
      workingDays: ["mon", "tue", "wed", "thu", "fri"],
      shiftStart: "08:00",
      shiftEnd: "22:00",
      latitude: 28.6139,
      longitude: 77.209,
    },
    inventory: {
      skus: buildDefaultInventorySkus(),
    },
    warehouse: {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      distanceKm: warehouse.distanceKm,
      transferTimeMins: warehouse.transferTimeMins,
      priority: warehouse.priority,
      autoRestocking: true,
      restockThresholdPercent: 20,
      emergencyReplenishment: false,
      allowedCategories: ["Construction Materials"],
      contacts: [...warehouse.contacts],
    },
    manager: {
      mode: "create",
      existingManagerId: "",
      fullName: DEFAULT_HUB_MANAGER.fullName,
      employeeId: DEFAULT_HUB_MANAGER.employeeId,
      phone: DEFAULT_HUB_MANAGER.phone,
      email: DEFAULT_HUB_MANAGER.email,
      permissions: [
        "orders",
        "inventory",
        "dispatch",
        "drivers",
        "reports",
        "payments",
        "requisitions",
      ],
      credentialsGenerated: true,
      generatedUsername: DEFAULT_HUB_MANAGER.username,
      generatedPassword: DEFAULT_HUB_MANAGER.password,
      sendWhatsAppWelcome: true,
    },
    fleet: {
      drivers: [
        {
          id: "drv-draft-1",
          name: "Rajesh Kumar",
          phone: "9876543211",
          licenseNo: "WB12AB1234",
          vehicleType: "Bike",
          avatarInitials: "RK",
        },
        {
          id: "drv-draft-2",
          name: "Sanjay Singh",
          phone: "9876543212",
          licenseNo: "WB20XY9988",
          vehicleType: "Pickup",
          avatarInitials: "SS",
        },
      ],
      vehicles: [
        {
          id: "veh-draft-1",
          vehicleType: "Bike",
          regNumber: "WB12AB1234",
          status: "active",
        },
        {
          id: "veh-draft-2",
          vehicleType: "Pickup",
          regNumber: "WB20XY9988",
          status: "active",
        },
      ],
      deliverySlots: ["morning", "evening"],
    },
    coverage: {
      radiusKm: 15,
      mode: "radius",
      pincodes: ["110001"],
      polygonPoints: [
        { x: 30, y: 35 },
        { x: 70, y: 28 },
        { x: 78, y: 68 },
        { x: 35, y: 75 },
      ],
      estimatedCustomers: 14280,
      nearbyHubs: 0,
      nearbyHubLabel: "—",
      conflictPercent: 0,
      conflictHubName: "",
      avgTransitMins: 22,
      peakDelayMins: 14,
      fuelEfficiency: "high",
      latitude: 28.6139,
      longitude: 77.209,
    },
  };
}

export function estimateHouseholdReach(radiusKm: number): string {
  const millions = Math.max(0.2, Number(((radiusKm / 15) * 1.2).toFixed(1)));
  return `${millions}M households within 45 mins delivery window`;
}

export function computeCoverageMetrics(radiusKm: number) {
  const scale = radiusKm / 12.5;
  return {
    estimatedCustomers: Math.round(14_280 * scale),
    conflictPercent: 0,
    avgTransitMins: Math.round(22 * Math.max(0.7, scale * 0.85)),
    peakDelayMins: Math.round(14 * Math.max(0.6, scale * 0.9)),
  };
}

export function hubTypeLabel(type: HubType): string {
  return (
    HUB_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}
