export type ExecutiveGender = "male" | "female" | "other";

export type ExecutiveResponsibilityKey =
  | "customerRegistration"
  | "assignCustomer"
  | "takePhoneOrders"
  | "orderFollowUp"
  | "complaintSupport"
  | "orderTracking";

export interface ExecutiveResponsibilities {
  customerRegistration: boolean;
  assignCustomer: boolean;
  takePhoneOrders: boolean;
  orderFollowUp: boolean;
  complaintSupport: boolean;
  orderTracking: boolean;
}

export interface ExecutiveDocumentFile {
  name: string;
  size: number;
  previewUrl: string;
  uploadedAt: string;
}

export interface ExecutiveDocuments {
  aadhaar: ExecutiveDocumentFile | null;
  pan: ExecutiveDocumentFile | null;
  photo: ExecutiveDocumentFile | null;
  offerLetter: ExecutiveDocumentFile | null;
  previousCompany: ExecutiveDocumentFile | null;
}

export interface ExecutiveOnboardingDraft {
  id: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  profilePhoto: string | null;
  fullName: string;
  employeeId: string;
  phone: string;
  email: string;
  dob: string;
  gender: ExecutiveGender | "";
  executiveType: string;
  branchOffice: string;
  department: string;
  designation: string;
  joiningDate: string;
  reportingHub: string;
  reportingHubName: string;
  reportingHubRegion: string;
  reportingHubDepartment: string;
  reportingHubBranch: string;
  state: string;
  city: string;
  zone: string;
  assignedHubs: string[];
  assignedHubNames: string[];
  estimatedCustomers: number;
  estimatedDailyOrders: number;
  responsibilities: ExecutiveResponsibilities;
  username: string;
  tempPassword: string;
  corporateEmail: string;
  sendWelcomeEmail: boolean;
  sendSms: boolean;
  forcePasswordReset: boolean;
  accountActive: boolean;
  credentialsGenerated: boolean;
  documents: ExecutiveDocuments;
}

export interface ExecutiveWizardStep {
  id: number;
  label: string;
  shortLabel: string;
}

export interface TerritoryOption {
  id: string;
  name: string;
  state?: string;
  city?: string;
  zone?: string;
  capacity?: string;
  type?: string;
}

export interface CreateExecutiveResult {
  id: string;
  employeeId: string;
  name: string;
  hubName: string;
  region: string;
  username: string;
  credentialsSent: boolean;
}
