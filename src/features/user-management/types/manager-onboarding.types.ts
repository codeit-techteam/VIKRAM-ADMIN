export type ManagerGender = "male" | "female" | "other";

export type EmploymentStatus = "active" | "probation" | "notice";

export type PermissionTemplate =
  "standard" | "inventory" | "operations" | "custom";

export interface ManagerPermissionSet {
  dashboard: boolean;
  inventory: boolean;
  dispatch: boolean;
  drivers: boolean;
  requisition: boolean;
  reports: boolean;
}

export interface ManagerDocumentFile {
  name: string;
  size: number;
  previewUrl: string;
  uploadedAt: string;
}

export interface ManagerDocuments {
  aadhaar: ManagerDocumentFile | null;
  pan: ManagerDocumentFile | null;
  offerLetter: ManagerDocumentFile | null;
  drivingLicense: ManagerDocumentFile | null;
  policeVerification: ManagerDocumentFile | null;
  bankDetails: ManagerDocumentFile | null;
}

export interface ManagerOnboardingDraft {
  id: string;
  currentStep: number;
  permissionsSkipped: boolean;
  createdAt: string;
  updatedAt: string;
  profilePhoto: string | null;
  fullName: string;
  employeeId: string;
  phone: string;
  email: string;
  dob: string;
  gender: ManagerGender | "";
  address: string;
  employeeType: string;
  department: string;
  joiningDate: string;
  reportingManager: string;
  reportingManagerName: string;
  employmentStatus: EmploymentStatus;
  region: string;
  city: string;
  warehouse: string;
  hub: string;
  hubName: string;
  hubCode: string;
  permissionTemplate: PermissionTemplate;
  permissions: ManagerPermissionSet;
  username: string;
  temporaryPassword: string;
  sendWelcomeEmail: boolean;
  sendSms: boolean;
  forcePasswordReset: boolean;
  accountActive: boolean;
  credentialsGenerated: boolean;
  documents: ManagerDocuments;
}

export interface ManagerWizardStep {
  id: number;
  label: string;
  shortLabel: string;
  optional?: boolean;
}

export interface HubAssignmentOption {
  id: string;
  name: string;
  code?: string;
  region?: string;
  city?: string;
  warehouse?: string;
  currentManager?: string;
  capacity?: string;
  coverageRadius?: string;
  currentInventory?: string;
  pendingDispatches?: number;
  pendingRequisitions?: number;
}

export interface CreateManagerResult {
  id: string;
  employeeId: string;
  name: string;
  hubName: string;
  hubCode: string;
  username: string;
  credentialsSent: boolean;
}
