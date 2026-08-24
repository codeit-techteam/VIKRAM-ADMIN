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
}): Promise<AdminUserListItem> {
  const { data } = await api.post<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.BASE,
    payload,
  );
  return data.data;
}

export async function updateAdminUser(
  id: string,
  payload: { fullName?: string; email?: string; phone?: string },
): Promise<AdminUserListItem> {
  const { data } = await api.patch<ApiEnvelope<AdminUserListItem>>(
    API_ENDPOINTS.ADMIN_USERS.BY_ID(id),
    payload,
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
  page?: number;
  limit?: number;
}): Promise<AdminUsersListResponse> {
  return fetchAdminUsers({
    ...params,
    role: "CUSTOMER_EXECUTIVE",
  });
}
