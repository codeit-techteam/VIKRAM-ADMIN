import { INVENTORY_ITEMS } from "@/mock/inventory";
import type {
  HubDraft,
  HubInventorySkuDraft,
  HubType,
  HubWizardStep,
  WeekDay,
} from "@/types/hub-onboarding.types";

export const HUB_DRAFT_STORAGE_KEY = "bq-hub-wizard-draft";
export const HUB_DRAFT_SAVED_AT_KEY = "bq-hub-wizard-draft-saved-at";

export const HUB_WIZARD_STEPS: HubWizardStep[] = [
  { id: 1, label: "Basic Information", shortLabel: "Basic Info" },
  { id: 2, label: "Inventory Configuration", shortLabel: "Inventory" },
  { id: 3, label: "Warehouse Mapping", shortLabel: "Warehouse" },
  { id: 4, label: "Hub Manager", shortLabel: "Manager" },
  { id: 5, label: "Logistics Configuration", shortLabel: "Logistics" },
  { id: 6, label: "Service Area Coverage", shortLabel: "Coverage" },
  { id: 7, label: "Review & Create", shortLabel: "Review" },
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

export const HUB_WAREHOUSE_OPTIONS = [
  {
    id: "wh-main",
    name: "Main Warehouse",
    distanceKm: 12.4,
    transferTimeMins: 45,
    priority: "Tier 1" as const,
    contacts: [
      {
        id: "wc-1",
        name: "Rajesh Sharma",
        role: "Warehouse Manager",
        availability: "on-duty" as const,
        phone: "+91 98100 22001",
      },
      {
        id: "wc-2",
        name: "Sanya Malhotra",
        role: "Fleet Coordinator",
        availability: "on-duty" as const,
        phone: "+91 98100 22002",
      },
    ],
  },
  {
    id: "wh-noida",
    name: "Noida Central Depot",
    distanceKm: 28.1,
    transferTimeMins: 75,
    priority: "Tier 2" as const,
    contacts: [
      {
        id: "wc-3",
        name: "Imran Qureshi",
        role: "Warehouse Manager",
        availability: "on-duty" as const,
        phone: "+91 98100 22003",
      },
    ],
  },
  {
    id: "wh-manesar",
    name: "Manesar Fulfillment Hub",
    distanceKm: 18.6,
    transferTimeMins: 55,
    priority: "Tier 1" as const,
    contacts: [
      {
        id: "wc-4",
        name: "Neha Kapoor",
        role: "Ops Lead",
        availability: "off-duty" as const,
        phone: "+91 98100 22004",
      },
    ],
  },
] as const;

export const PRODUCT_CATEGORY_OPTIONS = [
  "Construction Materials",
  "Safety Gear",
  "Heavy Machinery",
  "Electricals",
  "Finishing",
  "Cementing Materials",
  "Structural Steel",
  "Masonry & Blockwork",
  "Paints & Coatings",
] as const;

export const EXISTING_HUB_MANAGERS = [
  {
    id: "mgr-amit",
    fullName: "Amit Sharma",
    employeeId: "BW-HUB-101",
    phone: "9810011201",
    email: "amit.sharma@bajriwala.in",
  },
  {
    id: "mgr-sneha",
    fullName: "Sneha Reddy",
    employeeId: "BW-HUB-102",
    phone: "9810011202",
    email: "sneha.reddy@bajriwala.in",
  },
  {
    id: "mgr-deepak",
    fullName: "Deepak Gupta",
    employeeId: "BW-HUB-104",
    phone: "9810011204",
    email: "deepak.gupta@bajriwala.in",
  },
] as const;

export const MANAGER_PERMISSION_OPTIONS = [
  { value: "orders" as const, label: "Orders", icon: "shopping-cart" },
  { value: "inventory" as const, label: "Inventory", icon: "package" },
  { value: "dispatch" as const, label: "Dispatch", icon: "truck" },
  { value: "drivers" as const, label: "Drivers", icon: "id-card" },
  { value: "reports" as const, label: "Reports", icon: "chart" },
  { value: "payments" as const, label: "Payments", icon: "wallet" },
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

export function getStateCode(state: string): string {
  return STATE_CODE_MAP[state] ?? "IN";
}

export function generateHubCode(
  state: string,
  existingCodes: string[],
): string {
  const prefix = `HUB-${getStateCode(state)}-`;
  let seq = 1;

  const used = new Set(
    existingCodes
      .filter((code) => code.startsWith(prefix))
      .map((code) => Number(code.replace(prefix, "")) || 0),
  );

  while (used.has(seq)) seq += 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export function buildDefaultInventorySkus(): HubInventorySkuDraft[] {
  return INVENTORY_ITEMS.slice(0, 8).map((item, index) => {
    const opening = Math.max(
      Math.round(item.minimumStock * (0.4 + (index % 3) * 0.25)),
      index === 3 ? 12 : item.minimumStock,
    );
    const reorder = Math.round(item.minimumStock * 0.8);
    const safety = Math.round(item.minimumStock * 0.4);

    return {
      id: `hub-sku-${item.id}`,
      materialId: item.id,
      sku: item.sku,
      category: item.category,
      productName: item.productName,
      variant: item.categorySlug,
      unit: item.unit,
      openingStock: opening,
      reorderLevel: reorder,
      safetyStock: safety,
      maxStock: Math.max(item.minimumStock * 3, opening * 2),
      selected: index < 5,
    };
  });
}

export function createEmptyHubDraft(existingCodes: string[] = []): HubDraft {
  const now = new Date().toISOString();
  const warehouse = HUB_WAREHOUSE_OPTIONS[0];

  return {
    id: `draft-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    currentStep: 1,
    assignee: "Rohan Sharma",
    basic: {
      hubName: "",
      hubCode: generateHubCode("New Delhi", existingCodes),
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
      allowedCategories: [
        "Construction Materials",
        "Safety Gear",
        "Heavy Machinery",
      ],
      contacts: [...warehouse.contacts],
    },
    manager: {
      mode: "create",
      existingManagerId: "",
      fullName: "",
      employeeId: "",
      phone: "",
      email: "",
      permissions: ["orders", "inventory", "dispatch", "requisitions"],
      credentialsGenerated: false,
      sendWhatsAppWelcome: true,
    },
    fleet: {
      drivers: [
        {
          id: "drv-draft-1",
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          licenseNo: "DL-0420110045678",
          avatarInitials: "RK",
        },
        {
          id: "drv-draft-2",
          name: "Amit Singh",
          phone: "+91 98765 43211",
          licenseNo: "HR-1420110098765",
          avatarInitials: "AS",
        },
      ],
      vehicles: [
        {
          id: "veh-draft-1",
          vehicleType: "Tata Prima 4028.S",
          regNumber: "HR-55-AN-4028",
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
      nearbyHubs: 3,
      nearbyHubLabel: "Gurugram",
      conflictPercent: 8,
      conflictHubName: "Hub NH-48",
      avgTransitMins: 22,
      peakDelayMins: 14,
      fuelEfficiency: "high",
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
    conflictPercent: Math.min(25, Math.round(8 * scale)),
    avgTransitMins: Math.round(22 * Math.max(0.7, scale * 0.85)),
    peakDelayMins: Math.round(14 * Math.max(0.6, scale * 0.9)),
  };
}

export function hubTypeLabel(type: HubType): string {
  return (
    HUB_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}
