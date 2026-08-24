import type { DriverStatus, LogisticsDriver } from "@/types/logistics.types";

export interface ApiDriver {
  id: string;
  name: string;
  employeeId?: string | null;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  photoUrl?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  emergencyContactRelationship?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  licenseNumber?: string | null;
  licenseIssueDate?: string | null;
  licenseExpiry?: string | null;
  licenseType?: string | null;
  licenseIssuingState?: string | null;
  joiningDate?: string | null;
  employmentType?: string | null;
  shift?: string | null;
  onLeave?: boolean;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  aadhaarMasked?: string | null;
  panMasked?: string | null;
  bankAccountHolder?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  upiId?: string | null;
  remarks?: string | null;
  banking?: {
    accountHolder?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    accountNumberMasked?: string | null;
    ifscCode?: string | null;
    upiId?: string | null;
  } | null;
  hubId: string;
  warehouseHubId?: string | null;
  hub?: { id: string; name: string; code: string } | null;
  warehouseHub?: { id: string; name: string; code: string } | null;
  vehicle?: {
    id: string;
    registration: string;
    vehicleType?: string;
    vehicleCategory?: string | null;
    status?: string;
  } | null;
  vehicleId?: string | null;
  availability?: string;
  operationalStatus?: string;
  isActive: boolean;
  licenseExpired?: boolean;
  tripsToday?: number;
  tripsCompleted?: number;
  rating?: number | null;
  currentTrip?: {
    orderId: string;
    orderNumber: string;
    status: string;
    customerName?: string | null;
  } | null;
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    downloadUrl?: string | null;
  }>;
}

export function mapApiDriverStatusToUi(status?: string): DriverStatus {
  switch (status) {
    case "ON_TRIP":
    case "ON_DELIVERY":
      return "driving";
    case "ON_LEAVE":
    case "OFF_DUTY":
      return "on_leave";
    case "INACTIVE":
    case "SUSPENDED":
    case "BLOCKED":
      return "inactive";
    case "ASSIGNED":
    case "AVAILABLE":
    default:
      return "available";
  }
}

export function mapUiStatusFilterToApi(status: string): string | undefined {
  if (!status || status === "all") return undefined;
  switch (status) {
    case "driving":
      return "ON_TRIP";
    case "on_leave":
      return "ON_LEAVE";
    case "inactive":
      return "INACTIVE";
    case "available":
      return "AVAILABLE";
    default:
      return status.toUpperCase();
  }
}

function dateOnly(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function mapApiDriverToLogistics(d: ApiDriver): LogisticsDriver {
  const docs = d.documents ?? [];
  const findDoc = (type: string) =>
    docs.find((x) => x.documentType === type) ?? null;

  return {
    id: d.id,
    photoUrl: d.photoUrl ?? null,
    name: d.name,
    employeeId: d.employeeId ?? "—",
    mobile: d.phone,
    alternatePhone: d.alternatePhone ?? undefined,
    email: d.email ?? undefined,
    gender: d.gender ?? undefined,
    dob: dateOnly(d.dateOfBirth) || undefined,
    bloodGroup: d.bloodGroup ?? undefined,
    emergencyContactName: d.emergencyContactName ?? undefined,
    emergencyContactNumber: d.emergencyContactNumber ?? undefined,
    emergencyContactRelationship: d.emergencyContactRelationship ?? undefined,
    address: d.address ?? undefined,
    city: d.city ?? undefined,
    state: d.state ?? undefined,
    pinCode: d.pinCode ?? undefined,
    licenseNumber: d.licenseNumber ?? "—",
    licenseIssueDate: dateOnly(d.licenseIssueDate) || undefined,
    licenseExpiry: dateOnly(d.licenseExpiry),
    licenseType: d.licenseType ?? undefined,
    licenseIssuingState: d.licenseIssuingState ?? undefined,
    joiningDate: dateOnly(d.joiningDate) || undefined,
    employmentType: d.employmentType ?? undefined,
    shift: d.shift ?? undefined,
    aadhaarNumber: d.aadhaarNumber ?? undefined,
    panNumber: d.panNumber ?? undefined,
    banking: d.banking
      ? {
          accountHolder: d.banking.accountHolder ?? "",
          bankName: d.banking.bankName ?? "",
          accountNumber: d.banking.accountNumber ?? "",
          ifscCode: d.banking.ifscCode ?? "",
          upiId: d.banking.upiId ?? undefined,
        }
      : d.bankAccountNumber
        ? {
            accountHolder: d.bankAccountHolder ?? "",
            bankName: d.bankName ?? "",
            accountNumber: d.bankAccountNumber,
            ifscCode: d.bankIfscCode ?? "",
            upiId: d.upiId ?? undefined,
          }
        : undefined,
    remarks: d.remarks ?? undefined,
    assignedHub: d.hub?.name ?? "",
    assignedWarehouse: d.warehouseHub?.name ?? "",
    hubId: d.hubId ?? d.hub?.id,
    warehouseHubId: d.warehouseHubId ?? d.warehouseHub?.id ?? null,
    assignedVehicleId: d.vehicle?.id ?? d.vehicleId ?? null,
    assignedVehicleNumber: d.vehicle?.registration ?? null,
    tripsToday: d.tripsToday ?? 0,
    tripsCompleted: d.tripsCompleted ?? 0,
    documents: {
      drivingLicense: findDoc("DRIVING_LICENSE")
        ? {
            name: findDoc("DRIVING_LICENSE")!.fileName,
            size: 0,
            previewUrl: findDoc("DRIVING_LICENSE")!.downloadUrl ?? undefined,
            uploadedAt: new Date().toISOString(),
          }
        : null,
      aadhaar: findDoc("AADHAAR")
        ? {
            name: findDoc("AADHAAR")!.fileName,
            size: 0,
            previewUrl: findDoc("AADHAAR")!.downloadUrl ?? undefined,
            uploadedAt: new Date().toISOString(),
          }
        : null,
      pan: findDoc("PAN")
        ? {
            name: findDoc("PAN")!.fileName,
            size: 0,
            previewUrl: findDoc("PAN")!.downloadUrl ?? undefined,
            uploadedAt: new Date().toISOString(),
          }
        : null,
      profilePhoto: findDoc("DRIVER_PHOTO")
        ? {
            name: findDoc("DRIVER_PHOTO")!.fileName,
            size: 0,
            previewUrl: findDoc("DRIVER_PHOTO")!.downloadUrl ?? undefined,
            uploadedAt: new Date().toISOString(),
          }
        : null,
    },
    status: mapApiDriverStatusToUi(d.operationalStatus ?? d.availability),
  };
}

/** Extra hub/warehouse IDs carried alongside LogisticsDriver for API writes */
export type DriverApiIds = {
  hubId: string;
  warehouseHubId?: string | null;
};
