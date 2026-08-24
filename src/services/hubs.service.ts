import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import type { CreateHubResult } from "@/types/hub-onboarding.types";
import { CAPACITY_MT_BY_TIER, MAIN_WAREHOUSE } from "@/mock/hub-onboarding";

export interface AdminHubListItem {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  capacity: number | null;
  workingHours: string | null;
  hubType?: string | null;
  warehouseCode?: string | null;
  serviceRadiusKm?: number;
  coveragePincodes?: string[];
  isActive: boolean;
  status: string;
  operationalStatus: "ENABLED" | "DISABLED" | "SUSPENDED";
  routingReady?: boolean;
  routingWarning?: string | null;
  healthStatus?: "HEALTHY" | "ATTENTION" | "CRITICAL";
  inventoryHealth?: number;
  totalStock?: number;
  stockValue?: number;
  pendingRequisitions?: number;
  incomingTransfers?: number;
  outgoingTransfers?: number;
  activeDrivers?: number;
  manager?: {
    id: string;
    name: string;
    fullName: string;
    employeeId: string;
    email: string | null;
    phone: string | null;
  } | null;
  orderCount?: number;
  pendingOrders?: number;
  driverCount?: number;
  vehicleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminHubDetail extends AdminHubListItem {
  addressLine1: string;
  addressLine2: string | null;
  inventorySummary?: {
    totalProducts: number;
    stockValue: number;
    lowStock: number;
    outOfStock: number;
    inventoryHealth?: number;
    items?: Array<{
      id: string;
      productId: string;
      productName?: string;
      availableStock: number;
      reservedStock: number;
      currentStock: number;
      lowStock: boolean;
    }>;
  };
  pendingOrders?: number;
  completedOrders?: number;
  drivers?: Array<{
    id: string;
    name: string;
    phone: string;
    availability: string;
  }>;
  vehicles?: Array<{
    id: string;
    registration: string;
    vehicleType: string;
    status: string;
  }>;
  performance?: Record<string, unknown>;
}

export interface ProvisionHubResponse {
  hub: AdminHubListItem;
  manager: {
    id: string;
    fullName: string;
    employeeId: string;
    email: string | null;
    phone: string | null;
    role: string;
    temporaryPassword: string;
  };
  credentials: {
    username: string;
    password: string;
  };
  inventoryCount: number;
  driverCount: number;
  vehicleCount: number;
}

export interface CreateHubResultWithCredentials extends CreateHubResult {
  managerUsername?: string;
  managerPassword?: string;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  kalyani: { lat: 22.975, lng: 88.434 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.391 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  manesar: { lat: 28.3543, lng: 76.939 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

export function resolveCoords(city: string, pincode: string) {
  const key = city.trim().toLowerCase();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  const n = Number(pincode) || 110001;
  const lat = 20 + ((n % 9000) / 9000) * 12;
  const lng = 72 + ((Math.floor(n / 10) % 9000) / 9000) * 18;
  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
  };
}

function capacityFromDraft(draft: HubFormSchema): number {
  if (draft.basic.capacityTier === "custom") {
    return Math.max(1, Math.round(draft.basic.customCapacityMt));
  }
  return CAPACITY_MT_BY_TIER[draft.basic.capacityTier] || 2000;
}

function mapVehicleType(value: string): string {
  const upper = value.toUpperCase();
  if (upper.includes("BIKE")) return "BIKE";
  if (upper.includes("TEMPO") || upper.includes("PICKUP")) return "TEMPO";
  if (upper.includes("TRUCK")) return "TRUCK";
  return "OTHER";
}

export function mapHubDraftToProvisionPayload(draft: HubFormSchema) {
  const coords =
    draft.coverage.latitude && draft.coverage.longitude
      ? { lat: draft.coverage.latitude, lng: draft.coverage.longitude }
      : draft.basic.latitude && draft.basic.longitude
        ? { lat: draft.basic.latitude, lng: draft.basic.longitude }
        : resolveCoords(draft.basic.city, draft.basic.pincode);

  const workingHours = `${draft.basic.workingDays.join(",").toUpperCase()} ${draft.basic.shiftStart}-${draft.basic.shiftEnd}`;

  const selectedSkus = draft.inventory.skus.filter((sku) => sku.selected);
  const inventory = selectedSkus.map((sku) => ({
    productId: sku.productId || undefined,
    variantId: sku.variantId || undefined,
    sku: sku.sku,
    productName: sku.productName,
    availableQty: Math.round(sku.openingStock),
    lowStockThreshold: Math.round(sku.reorderLevel || 10),
    minimumStock: Math.round(sku.safetyStock || 0),
    maximumStock: Math.round(sku.maxStock || 0) || undefined,
  }));

  const firstName = draft.manager.fullName.trim().split(/\s+/)[0] || "Rahul";
  const password =
    draft.manager.generatedPassword?.trim() ||
    `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}@123`;

  return {
    name: draft.basic.hubName.trim(),
    code: draft.basic.hubCode.trim().toUpperCase(),
    address: draft.basic.detailedAddress.trim(),
    city: draft.basic.city.trim(),
    state: draft.basic.state.trim(),
    pincode: draft.basic.pincode.trim(),
    latitude: coords.lat,
    longitude: coords.lng,
    phone: draft.manager.phone.replace(/\s+/g, "") || undefined,
    email: draft.manager.email.trim().toLowerCase() || undefined,
    capacity: capacityFromDraft(draft),
    workingHours,
    hubType: draft.basic.hubType,
    warehouseId: MAIN_WAREHOUSE.id,
    warehouseCode: MAIN_WAREHOUSE.name,
    isActive: draft.basic.isActive,
    manager: {
      fullName: draft.manager.fullName.trim(),
      employeeId: (draft.manager.generatedUsername || draft.manager.employeeId)
        .trim()
        .toLowerCase(),
      email: draft.manager.email.trim().toLowerCase(),
      phone: draft.manager.phone.replace(/\s+/g, ""),
      password,
    },
    inventory,
    coverage: {
      serviceRadiusKm:
        draft.coverage.radiusKm || draft.basic.coverageRadiusKm || 15,
      pincodes:
        draft.coverage.pincodes?.length > 0
          ? draft.coverage.pincodes
          : [draft.basic.pincode],
      polygon: draft.coverage.polygonPoints?.length
        ? { points: draft.coverage.polygonPoints }
        : undefined,
    },
    drivers: draft.fleet.drivers.map((d) => ({
      name: d.name,
      phone: d.phone.replace(/\D/g, "").slice(-10) || d.phone,
      vehicleType: mapVehicleType(d.vehicleType || "BIKE"),
      vehicleNumber: d.licenseNo,
    })),
    vehicles: draft.fleet.vehicles.map((v) => ({
      registration: v.regNumber,
      vehicleType: mapVehicleType(v.vehicleType),
      capacity: 10,
    })),
  };
}

export const hubsService = {
  list: async (
    params?: PaginationParams & {
      status?: string;
      city?: string;
      state?: string;
      manager?: string;
    },
  ): Promise<PaginatedResponse<AdminHubListItem>> => {
    const { data } = await api.get<
      ApiResponse<{
        data: AdminHubListItem[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(API_ENDPOINTS.SUBHUB.BASE, { params });

    const payload = data.data;
    return {
      data: payload.data,
      meta: {
        page: payload.meta.page,
        limit: payload.meta.limit,
        total: payload.meta.total,
        totalPages: payload.meta.totalPages,
        hasNextPage: payload.meta.page < payload.meta.totalPages,
        hasPreviousPage: payload.meta.page > 1,
      },
    };
  },

  getById: async (id: string): Promise<AdminHubDetail> => {
    const { data } = await api.get<
      ApiResponse<{
        hub: AdminHubListItem & {
          addressLine1?: string;
          addressLine2?: string | null;
          serviceRadiusKm?: number;
          coveragePincodes?: string[];
          warehouseCode?: string | null;
          hubType?: string | null;
        };
        manager: AdminHubDetail["manager"];
        inventorySummary: AdminHubDetail["inventorySummary"];
        pendingOrders: number;
        completedOrders: number;
        drivers: AdminHubDetail["drivers"];
        vehicles: AdminHubDetail["vehicles"];
        performance: Record<string, unknown>;
      }>
    >(API_ENDPOINTS.SUBHUB.BY_ID(id));

    const payload = data.data;
    return {
      ...payload.hub,
      address: payload.hub.address || payload.hub.addressLine1 || "",
      addressLine1: payload.hub.addressLine1 || payload.hub.address || "",
      addressLine2: payload.hub.addressLine2 ?? null,
      manager: payload.manager,
      inventorySummary: payload.inventorySummary,
      pendingOrders: payload.pendingOrders,
      completedOrders: payload.completedOrders,
      drivers: payload.drivers,
      vehicles: payload.vehicles,
      performance: payload.performance,
    };
  },

  getInventory: async (id: string) => {
    const { data } = await api.get<
      ApiResponse<AdminHubDetail["inventorySummary"]>
    >(API_ENDPOINTS.SUBHUB.INVENTORY(id));
    return data.data;
  },

  listInventory: async (
    idOrParams?:
      | string
      | {
          hubId?: string;
          page?: number;
          limit?: number;
          search?: string;
          category?: string;
        },
    maybeParams?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
    },
  ) => {
    const isScoped = typeof idOrParams === "string";
    const hubId = isScoped ? idOrParams : idOrParams?.hubId;
    const params = isScoped
      ? maybeParams
      : {
          page: idOrParams?.page,
          limit: idOrParams?.limit,
          search: idOrParams?.search,
          category: idOrParams?.category,
        };

    type InventoryRow = {
      id: string;
      hubId: string;
      hubName?: string;
      productId: string;
      productName: string;
      sku: string | null;
      category: string | null;
      unit: string;
      imageUrl: string | null;
      availableQty: number;
      reservedQty: number;
      freeQty: number;
      unitPrice?: number;
      inventoryValue?: number;
      reorderLevel: number;
      minimumStock?: number;
      maximumStock?: number | null;
      status: string;
      lastUpdated: string;
    };

    const { data } = await api.get<
      ApiResponse<{
        data: InventoryRow[];
        stats?: {
          totalInventoryUnits: number;
          reservedInventory: number;
          lowStockItems: number;
          inventoryValue: number;
        };
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(
      hubId
        ? API_ENDPOINTS.SUBHUB.INVENTORY(hubId)
        : API_ENDPOINTS.SUBHUB.NETWORK_INVENTORY,
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          category: params?.category,
          ...(hubId ? { paginated: true } : {}),
        },
      },
    );
    return data.data;
  },

  getSummary: async (id: string) => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.SUBHUB.SUMMARY(id),
    );
    return data.data;
  },

  listDispatchLogs: async (params?: {
    hubId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date?: string;
  }) => {
    const hubId = params?.hubId;
    const { data } = await api.get<
      ApiResponse<{
        data: Array<Record<string, unknown>>;
        stats: {
          todaysDispatch: number;
          inProgress: number;
          delivered: number;
          delayed: number;
        };
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(
      hubId
        ? API_ENDPOINTS.SUBHUB.DISPATCH_LOGS(hubId)
        : API_ENDPOINTS.SUBHUB.NETWORK_DISPATCH_LOGS,
      {
        params: hubId
          ? {
              page: params?.page,
              limit: params?.limit,
              search: params?.search,
              status: params?.status,
              date: params?.date,
            }
          : params,
      },
    );
    return data.data;
  },

  getOrders: async (
    id: string,
    params?: { page?: number; limit?: number; status?: string },
  ) => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.SUBHUB.ORDERS(id),
      { params },
    );
    return data.data;
  },

  getPerformance: async (id: string) => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.SUBHUB.PERFORMANCE(id),
      {},
    );
    return data.data;
  },

  provision: async (draft: HubFormSchema): Promise<ProvisionHubResponse> => {
    const payload = mapHubDraftToProvisionPayload(draft);
    const { data } = await api.post<ApiResponse<ProvisionHubResponse>>(
      API_ENDPOINTS.SUBHUB.PROVISION,
      payload,
    );
    return data.data;
  },

  create: async (payload: unknown): Promise<AdminHubListItem> => {
    const { data } = await api.post<ApiResponse<AdminHubListItem>>(
      API_ENDPOINTS.SUBHUB.BASE,
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: unknown): Promise<AdminHubListItem> => {
    const { data } = await api.patch<ApiResponse<AdminHubListItem>>(
      API_ENDPOINTS.SUBHUB.BY_ID(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.SUBHUB.BY_ID(id));
  },

  updateStatus: async (
    id: string,
    action: "ENABLE" | "DISABLE" | "SUSPEND",
  ): Promise<AdminHubListItem> => {
    const { data } = await api.patch<ApiResponse<AdminHubListItem>>(
      API_ENDPOINTS.SUBHUB.STATUS(id),
      { action },
    );
    return data.data;
  },
};

export function mapProvisionToCreateResult(
  response: ProvisionHubResponse,
): CreateHubResultWithCredentials {
  return {
    hubId: response.hub.id,
    hubCode: response.hub.code,
    hubName: response.hub.name,
    managerUsername: response.credentials.username,
    managerPassword: response.credentials.password,
  };
}
