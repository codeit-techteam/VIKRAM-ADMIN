import type { LogisticsVehicle, VehicleStatus } from "@/types/logistics.types";

export interface ApiVehicle {
  id: string;
  registration: string;
  capacity: number;
  payloadKg?: number | null;
  vehicleType: string;
  vehicleCategory?: string | null;
  fuelType?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  vehicleColor?: string | null;
  fastagNumber?: string | null;
  odometerKm?: number | null;
  emergencyContact?: string | null;
  remarks?: string | null;
  status: string;
  isActive: boolean;
  registrationDate?: string | null;
  insuranceNumber?: string | null;
  insuranceExpiry?: string | null;
  fitnessCertificateNumber?: string | null;
  fitnessExpiry?: string | null;
  pucNumber?: string | null;
  pucExpiry?: string | null;
  permitType?: string | null;
  permitNumber?: string | null;
  permitExpiry?: string | null;
  roadTaxStatus?: string | null;
  roadTaxExpiry?: string | null;
  hubId: string;
  warehouseHubId?: string | null;
  hub?: { id: string; name: string; code: string } | null;
  warehouseHub?: { id: string; name: string; code: string } | null;
  driver?: {
    id: string;
    name: string;
    phone: string;
    availability: string;
  } | null;
  dispatches?: Array<{
    id: string;
    dispatchNo: string;
    status: string;
    order?: { id: string; orderNumber: string } | null;
  }>;
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    downloadUrl?: string;
    expiryDate?: string | null;
  }>;
  compliance?: {
    isCompliant: boolean;
    flags: Record<string, string>;
  };
  currentOrderId?: string | null;
  currentDispatchId?: string | null;
}

export function mapApiStatusToUi(status: string): VehicleStatus {
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "ASSIGNED":
      return "assigned";
    case "LOADING":
      return "loading";
    case "OUT_FOR_DELIVERY":
    case "REACHED":
    case "RETURNING":
      return "running";
    case "MAINTENANCE":
      return "maintenance";
    case "INACTIVE":
    case "BLOCKED":
    case "DOCUMENT_EXPIRED":
    default:
      return "inactive";
  }
}

export function mapUiStatusToApi(status: VehicleStatus | string): string {
  switch (status) {
    case "available":
      return "AVAILABLE";
    case "assigned":
      return "ASSIGNED";
    case "loading":
      return "LOADING";
    case "running":
      return "OUT_FOR_DELIVERY";
    case "maintenance":
      return "MAINTENANCE";
    case "inactive":
      return "INACTIVE";
    default:
      return "AVAILABLE";
  }
}

export function mapUiStatusFilterToApi(status: string): string | undefined {
  if (!status || status === "all") return undefined;
  return mapUiStatusToApi(status as VehicleStatus);
}

function dateOnly(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function mapApiVehicleToLogistics(v: ApiVehicle): LogisticsVehicle {
  const capacityTons = Number(v.capacity ?? 0);
  const payloadKg =
    v.payloadKg != null
      ? Number(v.payloadKg)
      : Math.round(capacityTons * 1000);
  const activeDispatch = v.dispatches?.[0];

  const docs = v.documents ?? [];
  const findDoc = (type: string) =>
    docs.find((d) => d.documentType === type) ?? null;

  return {
    id: v.id,
    vehicleNumber: v.registration,
    vehicleType: v.vehicleCategory || v.vehicleType || "TRUCK",
    capacityKg: payloadKg,
    capacityLabel: capacityTons > 0 ? `${capacityTons}T` : undefined,
    assignedWarehouse: v.warehouseHub?.name ?? "",
    assignedHub: v.hub?.name ?? "",
    assignedDriverId: v.driver?.id ?? null,
    assignedDriverName: v.driver?.name ?? null,
    currentShipmentId:
      activeDispatch?.order?.orderNumber ??
      activeDispatch?.dispatchNo ??
      v.currentOrderId ??
      null,
    fuelType: v.fuelType ?? "Diesel",
    manufacturer: v.manufacturer ?? undefined,
    model: v.model ?? undefined,
    yearOfManufacture: v.manufactureYear ?? undefined,
    registrationDate: dateOnly(v.registrationDate),
    insuranceExpiry: dateOnly(v.insuranceExpiry),
    fitnessExpiry: dateOnly(v.fitnessExpiry),
    pollutionExpiry: dateOnly(v.pucExpiry) || undefined,
    permitType: v.permitType ?? undefined,
    permitExpiry: dateOnly(v.permitExpiry) || undefined,
    currentOdometer:
      v.odometerKm != null ? Number(v.odometerKm) : undefined,
    fastagNumber: v.fastagNumber ?? undefined,
    vehicleColor: v.vehicleColor ?? undefined,
    emergencyContact: v.emergencyContact ?? undefined,
    remarks: v.remarks ?? undefined,
    photoUrl: null,
    documents: {
      rc: findDoc("RC")
        ? {
            name: findDoc("RC")!.fileName,
            size: 0,
            previewUrl: findDoc("RC")!.downloadUrl,
            uploadedAt: new Date().toISOString(),
          }
        : null,
      insurance: findDoc("INSURANCE")
        ? {
            name: findDoc("INSURANCE")!.fileName,
            size: 0,
            previewUrl: findDoc("INSURANCE")!.downloadUrl,
            uploadedAt: new Date().toISOString(),
          }
        : null,
      fitness: findDoc("FITNESS")
        ? {
            name: findDoc("FITNESS")!.fileName,
            size: 0,
            previewUrl: findDoc("FITNESS")!.downloadUrl,
            uploadedAt: new Date().toISOString(),
          }
        : null,
    },
    status: mapApiStatusToUi(v.status),
  };
}

export function parseCapacityTons(label?: string, payloadKg?: number): number {
  if (label) {
    const m = label.match(/([\d.]+)/);
    if (m) return Number(m[1]);
  }
  if (payloadKg && payloadKg > 0) return payloadKg / 1000;
  return 0;
}

export function mapVehicleTypeToApi(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("tempo")) return "TEMPO";
  if (t.includes("bike") || t.includes("two")) return "BIKE";
  if (t.includes("other")) return "OTHER";
  return "TRUCK";
}
