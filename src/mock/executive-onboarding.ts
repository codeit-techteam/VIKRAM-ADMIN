import type {
  ExecutiveOnboardingDraft,
  ExecutiveResponsibilities,
  ExecutiveWizardStep,
  TerritoryOption,
} from "@/features/user-management/types/executive-onboarding.types";

export const EXECUTIVE_DRAFT_STORAGE_KEY = "bq-executive-wizard-draft";
export const EXECUTIVE_DRAFT_SAVED_AT_KEY =
  "bq-executive-wizard-draft-saved-at";

export const EXECUTIVE_WIZARD_STEPS: ExecutiveWizardStep[] = [
  { id: 1, label: "Basic Information", shortLabel: "Basic Information" },
  { id: 2, label: "Office Details", shortLabel: "Office Details" },
  { id: 3, label: "Area Assignment", shortLabel: "Area Assignment" },
  { id: 4, label: "Responsibilities", shortLabel: "Responsibilities" },
  { id: 5, label: "Login Setup", shortLabel: "Login Setup" },
  { id: 6, label: "Documents", shortLabel: "Documents" },
  { id: 7, label: "Review", shortLabel: "Review" },
];

export const BRANCH_OFFICE_OPTIONS = [
  { value: "delhi", label: "Delhi Branch" },
  { value: "mumbai", label: "Mumbai Branch" },
  { value: "gurgaon", label: "Gurgaon Branch" },
  { value: "noida", label: "Noida Branch" },
  { value: "kolkata", label: "Kolkata Branch" },
];

export const REPORTING_HUB_OPTIONS = [
  {
    id: "delhi-central",
    name: "Delhi Central Hub",
    region: "North Region",
    department: "Customer Operations",
    branch: "Delhi Branch",
  },
  {
    id: "mumbai-hub",
    name: "Mumbai Hub",
    region: "West Region",
    department: "Customer Operations",
    branch: "Mumbai Branch",
  },
  {
    id: "noida-hub",
    name: "Noida Hub",
    region: "North NCR",
    department: "Customer Operations",
    branch: "Noida Branch",
  },
  {
    id: "kolkata-hub",
    name: "Kolkata Hub",
    region: "East Region",
    department: "Customer Operations",
    branch: "Kolkata Branch",
  },
];

export const TERRITORY_DATA: {
  states: TerritoryOption[];
  cities: TerritoryOption[];
  zones: TerritoryOption[];
  hubs: TerritoryOption[];
} = {
  states: [
    { id: "haryana", name: "Haryana" },
    { id: "maharashtra", name: "Maharashtra" },
    { id: "delhi", name: "Delhi" },
    { id: "uttar-pradesh", name: "Uttar Pradesh" },
    { id: "west-bengal", name: "West Bengal" },
  ],
  cities: [
    { id: "gurgaon", name: "Gurgaon", state: "haryana" },
    { id: "manesar", name: "Manesar", state: "haryana" },
    { id: "sohna", name: "Sohna", state: "haryana" },
    { id: "mumbai", name: "Mumbai", state: "maharashtra" },
    { id: "pune", name: "Pune", state: "maharashtra" },
    { id: "new-delhi", name: "New Delhi", state: "delhi" },
    { id: "noida", name: "Noida", state: "uttar-pradesh" },
    { id: "kolkata", name: "Kolkata", state: "west-bengal" },
  ],
  zones: [
    { id: "gurgaon-north", name: "Gurgaon North Zone", city: "gurgaon" },
    { id: "gurgaon-south", name: "Gurgaon South Zone", city: "gurgaon" },
    {
      id: "manesar-industrial",
      name: "Manesar Industrial Zone",
      city: "manesar",
    },
    { id: "sohna-corridor", name: "Sohna Corridor", city: "sohna" },
    { id: "mumbai-west", name: "Mumbai West & Central", city: "mumbai" },
    { id: "mumbai-east", name: "Mumbai East Zone", city: "mumbai" },
    { id: "pune-west", name: "Pune West Zone", city: "pune" },
    { id: "delhi-south", name: "South Delhi Zone", city: "new-delhi" },
    { id: "noida-sector", name: "Noida Sector 62 Corridor", city: "noida" },
    { id: "kolkata-central", name: "Kolkata Central Zone", city: "kolkata" },
  ],
  hubs: [
    {
      id: "hub-gurgaon",
      name: "Gurgaon Hub",
      zone: "gurgaon-north",
      capacity: "35,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-manesar",
      name: "Manesar Hub",
      zone: "manesar-industrial",
      capacity: "28,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-sohna",
      name: "Sohna Hub",
      zone: "sohna-corridor",
      capacity: "18,000 sq.ft",
      type: "Node",
    },
    {
      id: "hub-gurgaon-south",
      name: "Gurgaon South Hub",
      zone: "gurgaon-south",
      capacity: "22,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-mumbai-central",
      name: "BKC Central Hub 002",
      zone: "mumbai-west",
      capacity: "45,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-vikhroli",
      name: "Vikhroli Logistics Center",
      zone: "mumbai-east",
      capacity: "38,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-bhiwandi",
      name: "Bhiwandi Storage Node",
      zone: "mumbai-west",
      capacity: "52,000 sq.ft",
      type: "Node",
    },
    {
      id: "hub-pune-west",
      name: "Pune West Hub",
      zone: "pune-west",
      capacity: "20,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-delhi-south",
      name: "Delhi South Hub",
      zone: "delhi-south",
      capacity: "30,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-noida",
      name: "Noida Sector 62 Hub",
      zone: "noida-sector",
      capacity: "25,000 sq.ft",
      type: "Hub",
    },
    {
      id: "hub-kolkata",
      name: "Kolkata Central Hub",
      zone: "kolkata-central",
      capacity: "32,000 sq.ft",
      type: "Hub",
    },
  ],
};

export const RESPONSIBILITY_CARDS: Array<{
  key: keyof ExecutiveResponsibilities;
  label: string;
  description: string;
  tag?: string;
  defaultOn: boolean;
}> = [
  {
    key: "customerRegistration",
    label: "Customer Registration",
    description:
      "Onboard new clients, verify GST details, and create procurement profiles.",
    tag: "REQUIRED",
    defaultOn: true,
  },
  {
    key: "assignCustomer",
    label: "Assign Customer",
    description:
      "Delegate specific client accounts to field officers or junior associates.",
    defaultOn: false,
  },
  {
    key: "takePhoneOrders",
    label: "Take Phone Orders",
    description:
      "Place orders on behalf of customers who need phone assistance.",
    tag: "CORE ACTION",
    defaultOn: true,
  },
  {
    key: "orderFollowUp",
    label: "Order Follow-up",
    description:
      "Manage outstanding invoices, credit limit alerts, and payment queries.",
    defaultOn: false,
  },
  {
    key: "complaintSupport",
    label: "Complaint Support",
    description:
      "Resolve material quality issues, quantity discrepancies, and returns.",
    tag: "CRITICAL",
    defaultOn: false,
  },
  {
    key: "orderTracking",
    label: "Order Tracking",
    description:
      "Monitor logistics status, ETA management, and proof-of-delivery verification.",
    defaultOn: true,
  },
];

export const DOCUMENT_DEFINITIONS = [
  { key: "aadhaar" as const, label: "Aadhaar Card", required: true },
  { key: "pan" as const, label: "PAN Card", required: true },
  { key: "photo" as const, label: "Professional Photo", required: true },
  { key: "offerLetter" as const, label: "Offer Letter", required: false },
  {
    key: "previousCompany" as const,
    label: "Previous Experience",
    required: false,
  },
];

const DEFAULT_RESPONSIBILITIES: ExecutiveResponsibilities = {
  customerRegistration: true,
  assignCustomer: false,
  takePhoneOrders: true,
  orderFollowUp: false,
  complaintSupport: false,
  orderTracking: true,
};

let employeeIdCounter = 1;

export function generateExecutiveEmployeeId(
  existingIds: string[] = [],
): string {
  let next = employeeIdCounter;
  let candidate = `BQ-EXEC-${String(next).padStart(4, "0")}`;
  while (existingIds.includes(candidate)) {
    next += 1;
    candidate = `BQ-EXEC-${String(next).padStart(4, "0")}`;
  }
  employeeIdCounter = next + 1;
  return candidate;
}

export function generateExecutiveUsername(
  fullName: string,
  employeeId: string,
): string {
  const parts = fullName.trim().toUpperCase().split(/\s+/);
  const first = parts[0]?.slice(0, 6) ?? "EXEC";
  const idSuffix = employeeId.replace(/\D/g, "").slice(-2);
  return `BQ_IND_${first}${idSuffix}`;
}

export function generateExecutivePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function createEmptyExecutiveDraft(
  existingEmployeeIds: string[] = [],
): ExecutiveOnboardingDraft {
  const now = new Date().toISOString();
  return {
    id: `exec-draft-${Date.now()}`,
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
    profilePhoto: null,
    fullName: "",
    employeeId: generateExecutiveEmployeeId(existingEmployeeIds),
    phone: "",
    email: "",
    dob: "",
    gender: "",
    executiveType: "customer-executive",
    branchOffice: "",
    department: "customer-operations",
    designation: "customer-executive",
    joiningDate: "",
    reportingHub: "",
    reportingHubName: "",
    reportingHubRegion: "",
    reportingHubDepartment: "Customer Operations",
    reportingHubBranch: "",
    state: "",
    city: "",
    zone: "",
    assignedHubs: [],
    assignedHubNames: [],
    estimatedCustomers: 0,
    estimatedDailyOrders: 0,
    responsibilities: { ...DEFAULT_RESPONSIBILITIES },
    username: "",
    tempPassword: "",
    corporateEmail: "",
    sendWelcomeEmail: true,
    sendSms: true,
    forcePasswordReset: true,
    accountActive: true,
    credentialsGenerated: false,
    documents: {
      aadhaar: null,
      pan: null,
      photo: null,
      offerLetter: null,
      previousCompany: null,
    },
  };
}

export function getCitiesByState(stateId: string) {
  return TERRITORY_DATA.cities.filter((c) => c.state === stateId);
}

export function getZonesByCity(cityId: string) {
  return TERRITORY_DATA.zones.filter((z) => z.city === cityId);
}

export function getHubsByZone(zoneId: string) {
  return TERRITORY_DATA.hubs.filter((h) => h.zone === zoneId);
}

export function getHubById(hubId: string) {
  return TERRITORY_DATA.hubs.find((h) => h.id === hubId);
}

export function getReportingHubById(id: string) {
  return REPORTING_HUB_OPTIONS.find((h) => h.id === id);
}

export function getStateById(id: string) {
  return TERRITORY_DATA.states.find((s) => s.id === id);
}

export function getCityById(id: string) {
  return TERRITORY_DATA.cities.find((c) => c.id === id);
}

export function getZoneById(id: string) {
  return TERRITORY_DATA.zones.find((z) => z.id === id);
}

export function estimateCoverage(hubCount: number) {
  return {
    estimatedCustomers: hubCount * 45 + 12,
    estimatedDailyOrders: hubCount * 18 + 5,
  };
}

export function getProgressPercent(currentStep: number): number {
  return Math.round((currentStep / EXECUTIVE_WIZARD_STEPS.length) * 100);
}
