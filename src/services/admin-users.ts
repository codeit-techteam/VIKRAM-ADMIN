import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt?: string;
  assignedCustomers?: number;
  assignedHubId?: string | null;
  assignedHubName?: string | null;
  assignedHubCity?: string | null;
  assignedHubState?: string | null;
  assignedHubType?: string | null;
  todayOrders?: number;
  totalOrders?: number;
  todayCalls?: number;
}

export interface AdminUsersListResponse {
  data: AdminUserListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  hubId?: string;
  region?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersListResponse> {
  const { data } = await api.get<ApiEnvelope<AdminUsersListResponse>>(
    API_ENDPOINTS.ADMIN_USERS.BASE,
    { params },
  );
  return data.data;
}

export async function fetchAdminUser(id: string): Promise<AdminUserListItem> {
  const { data } = await api.get<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.BY_ID(id),
  );
  return data.data;
}

export async function createAdminUser(payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: string;
  hubId?: string;
}): Promise<AdminUserListItem> {
  const { data } = await api.post<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.BASE,
    {
      name: payload.fullName,
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      role: payload.role,
      hubId: payload.hubId,
    },
  );
  return data.data;
}

export async function updateAdminUser(
  id: string,
  payload: { fullName?: string; email?: string; phone?: string; hubId?: string | null },
): Promise<AdminUserListItem> {
  const { data } = await api.patch<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.BY_ID(id),
    {
      name: payload.fullName,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      hubId: payload.hubId,
    },
  );
  return data.data;
}

export async function updateAdminUserStatus(
  id: string,
  action: "ACTIVATE" | "DEACTIVATE",
): Promise<AdminUserListItem> {
  const { data } = await api.patch<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.STATUS(id),
    { action },
  );
  return data.data;
}

export async function fetchCustomerExecutives(params?: {
  search?: string;
  status?: string;
  hubId?: string;
  region?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersListResponse> {
  return fetchAdminUsers({
    ...params,
    role: "CUSTOMER_EXECUTIVE",
  });
}

export interface AdminUserStats {
  totalExecutives: number;
  availableToday: number;
  ordersCreatedToday: number;
  customerCallsAssisted: number;
  joinedThisMonth: number;
}

export async function fetchAdminUserStats(
  role = "CUSTOMER_EXECUTIVE",
): Promise<AdminUserStats> {
  const { data } = await api.get<ApiEnvelope<AdminUserStats>>(
    API_ENDPOINTS.ADMIN_USERS.STATS,
    { params: { role } },
  );
  return data.data;
}

export async function assignAdminUserHub(
  id: string,
  hubId: string | null,
): Promise<AdminUserListItem> {
  const { data } = await api.patch<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.ASSIGNMENT(id),
    { hubId },
  );
  return data.data;
}

export async function exportAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  hubId?: string;
  region?: string;
}): Promise<Blob> {
  const { data } = await api.get<Blob>(API_ENDPOINTS.ADMIN_USERS.EXPORT, {
    params,
    responseType: "blob",
  });
  return data;
}
