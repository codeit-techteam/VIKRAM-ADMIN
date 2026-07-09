import type {
  HubAssignmentOption,
  ManagerOnboardingDraft,
  ManagerPermissionSet,
  ManagerWizardStep,
  PermissionTemplate,
} from "@/features/user-management/types/manager-onboarding.types";

export const MANAGER_DRAFT_STORAGE_KEY = "bq-manager-wizard-draft";
export const MANAGER_DRAFT_SAVED_AT_KEY = "bq-manager-wizard-draft-saved-at";

export const MANAGER_WIZARD_STEPS: ManagerWizardStep[] = [
  { id: 1, label: "Basic Information", shortLabel: "Basic Details" },
  { id: 2, label: "Employment Details", shortLabel: "Employment" },
  { id: 3, label: "Hub Assignment", shortLabel: "Assignment" },
  { id: 4, label: "Permissions", shortLabel: "Permissions", optional: true },
  { id: 5, label: "Login Credentials", shortLabel: "Login Credentials" },
  { id: 6, label: "Document Upload", shortLabel: "Documents" },
  { id: 7, label: "Review", shortLabel: "Review" },
];

export const DEPARTMENT_OPTIONS = [
  { value: "operations", label: "Operations" },
  { value: "warehouse", label: "Warehouse" },
  { value: "regional", label: "Regional" },
  { value: "supply-chain", label: "Supply Chain" },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "probation", label: "Probation" },
  { value: "notice", label: "Notice" },
];

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: "sub-hub-manager", label: "Sub Hub Manager" },
];

export const PERMISSION_TEMPLATE_OPTIONS: Array<{
  value: PermissionTemplate;
  label: string;
}> = [
  { value: "standard", label: "Standard Manager" },
  { value: "inventory", label: "Inventory Manager" },
  { value: "operations", label: "Operations Manager" },
  { value: "custom", label: "Custom" },
];

export const PERMISSION_MODULES: Array<{
  key: keyof ManagerPermissionSet;
  label: string;
}> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventory" },
  { key: "dispatch", label: "Dispatch" },
  { key: "drivers", label: "Drivers" },
  { key: "requisition", label: "Requisition" },
  { key: "reports", label: "Reports" },
];

export const PERMISSION_TEMPLATES: Record<
  PermissionTemplate,
  ManagerPermissionSet
> = {
  standard: {
    dashboard: true,
    inventory: true,
    dispatch: true,
    drivers: true,
    requisition: true,
    reports: true,
  },
  inventory: {
    dashboard: true,
    inventory: true,
    dispatch: false,
    drivers: false,
    requisition: true,
    reports: true,
  },
  operations: {
    dashboard: true,
    inventory: false,
    dispatch: true,
    drivers: true,
    requisition: true,
    reports: true,
  },
  custom: {
    dashboard: false,
    inventory: false,
    dispatch: false,
    drivers: false,
    requisition: false,
    reports: false,
  },
};

export const REPORTING_MANAGERS = [
  {
    id: "rm-001",
    name: "Sanjay Malhotra",
    employeeId: "BQ-MGR-101",
    department: "Regional Logistics",
  },
  {
    id: "rm-002",
    name: "Priya Nair",
    employeeId: "BQ-MGR-102",
    department: "Operations",
  },
  {
    id: "rm-003",
    name: "Vikram Singh",
    employeeId: "BQ-MGR-103",
    department: "Warehouse",
  },
  {
    id: "rm-004",
    name: "Anita Desai",
    employeeId: "BQ-MGR-104",
    department: "Supply Chain",
  },
  {
    id: "rm-005",
    name: "Rahul Kapoor",
    employeeId: "BQ-MGR-105",
    department: "Regional",
  },
];

export const HUB_ASSIGNMENT_DATA: {
  regions: HubAssignmentOption[];
  cities: HubAssignmentOption[];
  warehouses: HubAssignmentOption[];
  hubs: HubAssignmentOption[];
} = {
  regions: [
    { id: "north", name: "North" },
    { id: "south", name: "South" },
    { id: "west", name: "West" },
    { id: "east", name: "East" },
    { id: "central", name: "Central" },
  ],
  cities: [
    { id: "delhi", name: "Delhi", region: "north" },
    { id: "noida", name: "Noida", region: "north" },
    { id: "gurgaon", name: "Gurgaon", region: "north" },
    { id: "mumbai", name: "Mumbai", region: "west" },
    { id: "pune", name: "Pune", region: "west" },
    { id: "bangalore", name: "Bangalore", region: "south" },
    { id: "hyderabad", name: "Hyderabad", region: "south" },
    { id: "chennai", name: "Chennai", region: "south" },
    { id: "kolkata", name: "Kolkata", region: "east" },
    { id: "nagpur", name: "Nagpur", region: "central" },
  ],
  warehouses: [
    {
      id: "wh-del-central",
      name: "Delhi Central",
      city: "delhi",
      region: "north",
    },
    {
      id: "wh-ncr-regional",
      name: "NCR Regional Warehouse",
      city: "noida",
      region: "north",
    },
    {
      id: "wh-gur-central",
      name: "Gurgaon Central Warehouse",
      city: "gurgaon",
      region: "north",
    },
    {
      id: "wh-mum-central",
      name: "Mumbai Central Warehouse",
      city: "mumbai",
      region: "west",
    },
    {
      id: "wh-pun-regional",
      name: "Pune Regional Warehouse",
      city: "pune",
      region: "west",
    },
    {
      id: "wh-ban-warehouse",
      name: "Bangalore Warehouse",
      city: "bangalore",
      region: "south",
    },
    {
      id: "wh-hyd-warehouse",
      name: "Hyderabad Warehouse",
      city: "hyderabad",
      region: "south",
    },
    {
      id: "wh-che-warehouse",
      name: "Chennai Warehouse",
      city: "chennai",
      region: "south",
    },
    {
      id: "wh-kol-warehouse",
      name: "Kolkata Warehouse",
      city: "kolkata",
      region: "east",
    },
    {
      id: "wh-nag-warehouse",
      name: "Nagpur Warehouse",
      city: "nagpur",
      region: "central",
    },
  ],
  hubs: [
    {
      id: "hub-del-north",
      name: "Delhi North Hub",
      code: "DEL-N-01",
      warehouse: "wh-del-central",
      city: "delhi",
      region: "north",
      currentManager: "Vacant",
      capacity: "2,500 MT",
      coverageRadius: "18 km",
      currentInventory: "1,840 MT",
      pendingDispatches: 5,
      pendingRequisitions: 3,
    },
    {
      id: "hub-del-south",
      name: "Delhi South Hub",
      code: "DEL-S-01",
      warehouse: "wh-del-central",
      city: "delhi",
      region: "north",
      currentManager: "Arjun Mehta",
      capacity: "2,000 MT",
      coverageRadius: "15 km",
      currentInventory: "1,620 MT",
      pendingDispatches: 8,
      pendingRequisitions: 2,
    },
    {
      id: "hub-noida-hub",
      name: "Noida Hub - UP04",
      code: "NOI-04",
      warehouse: "wh-ncr-regional",
      city: "noida",
      region: "north",
      currentManager: "Vacant",
      capacity: "1,800 MT",
      coverageRadius: "12 km",
      currentInventory: "980 MT",
      pendingDispatches: 4,
      pendingRequisitions: 6,
    },
    {
      id: "hub-gur-central",
      name: "Gurgaon Central Hub",
      code: "GUR-012-CENT",
      warehouse: "wh-gur-central",
      city: "gurgaon",
      region: "north",
      currentManager: "Vacant",
      capacity: "2,200 MT",
      coverageRadius: "10 km",
      currentInventory: "1,450 MT",
      pendingDispatches: 12,
      pendingRequisitions: 7,
    },
    {
      id: "hub-mum-central",
      name: "Mumbai Central Hub",
      code: "MUM-01",
      warehouse: "wh-mum-central",
      city: "mumbai",
      region: "west",
      currentManager: "Priya Sharma",
      capacity: "3,000 MT",
      coverageRadius: "15 km",
      currentInventory: "2,100 MT",
      pendingDispatches: 16,
      pendingRequisitions: 9,
    },
    {
      id: "hub-pun-west",
      name: "Pune West Hub",
      code: "PUN-01",
      warehouse: "wh-pun-regional",
      city: "pune",
      region: "west",
      currentManager: "Vacant",
      capacity: "1,600 MT",
      coverageRadius: "12 km",
      currentInventory: "720 MT",
      pendingDispatches: 3,
      pendingRequisitions: 4,
    },
    {
      id: "hub-ban-south",
      name: "Bangalore South Hub",
      code: "BAN-01",
      warehouse: "wh-ban-warehouse",
      city: "bangalore",
      region: "south",
      currentManager: "Vacant",
      capacity: "2,400 MT",
      coverageRadius: "11 km",
      currentInventory: "1,200 MT",
      pendingDispatches: 6,
      pendingRequisitions: 5,
    },
    {
      id: "hub-hyd-east",
      name: "Hyderabad East Hub",
      code: "HYD-01",
      warehouse: "wh-hyd-warehouse",
      city: "hyderabad",
      region: "south",
      currentManager: "Rahul Verma",
      capacity: "2,100 MT",
      coverageRadius: "14 km",
      currentInventory: "1,680 MT",
      pendingDispatches: 10,
      pendingRequisitions: 8,
    },
  ],
};

export const DOCUMENT_DEFINITIONS = [
  {
    key: "aadhaar" as const,
    label: "Aadhaar Card",
    required: true,
    icon: "id",
  },
  {
    key: "pan" as const,
    label: "PAN Card",
    required: true,
    icon: "id",
  },
  {
    key: "offerLetter" as const,
    label: "Offer Letter",
    required: true,
    icon: "file",
  },
  {
    key: "drivingLicense" as const,
    label: "Driving License",
    required: false,
    icon: "car",
  },
  {
    key: "policeVerification" as const,
    label: "Police Verification",
    required: false,
    icon: "shield",
  },
  {
    key: "bankDetails" as const,
    label: "Bank Details (Cheque)",
    required: false,
    icon: "bank",
  },
];

let employeeIdCounter = 1;

export function generateEmployeeId(existingIds: string[] = []): string {
  let next = employeeIdCounter;
  let candidate = `BQ-MGR-${String(next).padStart(4, "0")}`;
  while (existingIds.includes(candidate)) {
    next += 1;
    candidate = `BQ-MGR-${String(next).padStart(4, "0")}`;
  }
  employeeIdCounter = next + 1;
  return candidate;
}

export function generateUsername(fullName: string, employeeId: string): string {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "m";
  const last = parts[parts.length - 1] ?? "manager";
  const idSuffix = employeeId.replace(/\D/g, "").slice(-4);
  return `${first}.${last}_bq${idSuffix}`;
}

export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function createEmptyManagerDraft(
  existingEmployeeIds: string[] = [],
): ManagerOnboardingDraft {
  const now = new Date().toISOString();
  return {
    id: `mgr-draft-${Date.now()}`,
    currentStep: 1,
    permissionsSkipped: false,
    createdAt: now,
    updatedAt: now,
    profilePhoto: null,
    fullName: "",
    employeeId: generateEmployeeId(existingEmployeeIds),
    phone: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    employeeType: "sub-hub-manager",
    department: "operations",
    joiningDate: "",
    reportingManager: "",
    reportingManagerName: "",
    employmentStatus: "active",
    region: "",
    city: "",
    warehouse: "",
    hub: "",
    hubName: "",
    hubCode: "",
    permissionTemplate: "standard",
    permissions: { ...PERMISSION_TEMPLATES.standard },
    username: "",
    temporaryPassword: "",
    sendWelcomeEmail: true,
    sendSms: true,
    forcePasswordReset: true,
    accountActive: true,
    credentialsGenerated: false,
    documents: {
      aadhaar: null,
      pan: null,
      offerLetter: null,
      drivingLicense: null,
      policeVerification: null,
      bankDetails: null,
    },
  };
}

export function getCitiesByRegion(regionId: string) {
  return HUB_ASSIGNMENT_DATA.cities.filter((c) => c.region === regionId);
}

export function getWarehousesByCity(cityId: string) {
  return HUB_ASSIGNMENT_DATA.warehouses.filter((w) => w.city === cityId);
}

export function getHubsByWarehouse(warehouseId: string) {
  return HUB_ASSIGNMENT_DATA.hubs.filter((h) => h.warehouse === warehouseId);
}

export function getHubById(hubId: string) {
  return HUB_ASSIGNMENT_DATA.hubs.find((h) => h.id === hubId);
}

export function getReportingManagerById(id: string) {
  return REPORTING_MANAGERS.find((m) => m.id === id);
}

export function getProgressPercent(currentStep: number): number {
  return Math.round((currentStep / MANAGER_WIZARD_STEPS.length) * 100);
}
