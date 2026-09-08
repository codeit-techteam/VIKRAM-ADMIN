import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  CreateDeliverySitePayload,
  DeliverySite,
  UpdateDeliverySitePayload,
} from "@/features/user-management/types/customer.types";

export interface AdminCustomerListItem {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  company: string | null;
  gst: string | null;
  customerType?: string | null;
  isVerified?: boolean;
  city?: string | null;
  state?: string | null;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  orders: number;
  wallet: { balance: number };
  loyaltyPoints?: number;
  addresses: number;
  assignedHubId?: string | null;
  assignedHubName?: string | null;
  assignedExecutiveId?: string | null;
  assignedExecutiveName?: string | null;
}

export interface AdminCustomersListResponse {
  data: AdminCustomerListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCustomerDetail {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  status: string;
  language?: string;
  profileCompleted?: boolean;
  roleSelected?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin: string | null;
  assignedHubId?: string | null;
  assignedHubName?: string | null;
  assignedExecutiveId?: string | null;
  assignedExecutiveName?: string | null;
  assignedExecutivePhone?: string | null;
  assignedExecutiveEmail?: string | null;
  isVerified?: boolean;
  profile: {
    companyName?: string | null;
    legalEntityName?: string | null;
    gstNumber?: string | null;
    gstVerified?: boolean;
    businessType?: string | null;
    registeredAddress?: string | null;
    panNumber?: string | null;
  } | null;
  addresses: Array<{
    id: string;
    label?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  loyalty: {
    availablePoints?: number;
    currentPoints?: number;
    redeemedPoints?: number;
  } | null;
  orders: unknown[];
}

export interface AdminCustomerStats {
  total: number;
  active: number;
  pendingVerification: number;
  blocked: number;
  newToday: number;
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export interface AdminCustomerFilterOptions {
  hubs: Array<{
    value: string;
    label: string;
    city?: string;
    state?: string;
    hubType?: string | null;
  }>;
  executives: Array<{ value: string; label: string }>;
  states: Array<{ value: string; label: string }>;
}

export async function fetchAdminCustomers(params?: {
  search?: string;
  status?: string;
  customerType?: string;
  hubId?: string;
  executiveId?: string;
  state?: string;
  city?: string;
  createdFrom?: string;
  createdTo?: string;
  ids?: string;
  page?: number;
  limit?: number;
}): Promise<AdminCustomersListResponse> {
  const { data } = await api.get<ApiEnvelope<AdminCustomersListResponse>>(
    API_ENDPOINTS.CUSTOMERS.BASE,
    { params },
  );
  return data.data;
}

export async function fetchAdminCustomerFilterOptions(): Promise<AdminCustomerFilterOptions> {
  const { data } = await api.get<ApiEnvelope<AdminCustomerFilterOptions>>(
    API_ENDPOINTS.CUSTOMERS.FILTER_OPTIONS,
  );
  return data.data;
}

export async function fetchAdminCustomerStats(): Promise<AdminCustomerStats> {
  const { data } = await api.get<ApiEnvelope<AdminCustomerStats>>(
    API_ENDPOINTS.CUSTOMERS.STATS,
  );
  return data.data;
}

export async function assignAdminCustomer(
  id: string,
  payload: {
    hubId?: string | null;
    executiveId?: string | null;
    reason?: string;
    notes?: string;
  },
): Promise<AdminCustomerDetail> {
  const { data } = await api.patch<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.ASSIGNMENT(id),
    payload,
  );
  return data.data;
}

export async function bulkUpdateAdminCustomerStatus(payload: {
  ids: string[];
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}): Promise<{ updated: number; status: string }> {
  const { data } = await api.post<
    ApiEnvelope<{ updated: number; status: string }>
  >(API_ENDPOINTS.CUSTOMERS.BULK_STATUS, payload);
  return data.data;
}

export async function bulkAssignAdminCustomers(payload: {
  ids: string[];
  hubId?: string | null;
  executiveId?: string | null;
  reason?: string;
}): Promise<{ updated: number }> {
  const { data } = await api.post<ApiEnvelope<{ updated: number }>>(
    API_ENDPOINTS.CUSTOMERS.BULK_ASSIGNMENT,
    payload,
  );
  return data.data;
}

export async function inviteAdminCustomer(payload: {
  phone: string;
  fullName: string;
  email?: string;
  companyName?: string;
  gstNumber?: string;
  businessType?: string;
  hubId?: string;
  executiveId?: string;
}): Promise<AdminCustomerDetail> {
  const { data } = await api.post<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.INVITE,
    payload,
  );
  return data.data;
}

export async function exportAdminCustomers(params?: {
  search?: string;
  status?: string;
  customerType?: string;
  hubId?: string;
  executiveId?: string;
  state?: string;
  city?: string;
  createdFrom?: string;
  createdTo?: string;
  ids?: string;
}): Promise<Blob> {
  const { data } = await api.get<Blob>(API_ENDPOINTS.CUSTOMERS.EXPORT, {
    params,
    responseType: "blob",
  });
  return data;
}

export async function fetchAdminCustomer(
  id: string,
): Promise<AdminCustomerDetail> {
  const { data } = await api.get<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.BY_ID(id),
  );
  return data.data;
}

export async function updateAdminCustomer(
  id: string,
  payload: {
    fullName?: string;
    email?: string;
    status?: string;
    companyName?: string;
    gstNumber?: string;
    businessType?: string;
  },
) {
  const { data } = await api.patch<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.BY_ID(id),
    payload,
  );
  return data.data;
}

export async function activateAdminCustomer(id: string) {
  const { data } = await api.post<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.ACTIVATE(id),
  );
  return data.data;
}

export async function disableAdminCustomer(id: string) {
  const { data } = await api.post<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.DISABLE(id),
  );
  return data.data;
}

export async function fetchCustomerSites(
  customerId: string,
): Promise<DeliverySite[]> {
  const { data } = await api.get<ApiEnvelope<DeliverySite[]>>(
    API_ENDPOINTS.CUSTOMERS.SITES(customerId),
  );
  return data.data;
}

export async function createCustomerSite(
  customerId: string,
  payload: CreateDeliverySitePayload,
): Promise<DeliverySite> {
  const { data } = await api.post<ApiEnvelope<DeliverySite>>(
    API_ENDPOINTS.CUSTOMERS.SITES(customerId),
    payload,
  );
  return data.data;
}

export async function updateCustomerSite(
  customerId: string,
  siteId: string,
  payload: UpdateDeliverySitePayload,
): Promise<DeliverySite> {
  const { data } = await api.put<ApiEnvelope<DeliverySite>>(
    API_ENDPOINTS.CUSTOMERS.SITE_BY_ID(customerId, siteId),
    payload,
  );
  return data.data;
}

export async function deleteCustomerSite(
  customerId: string,
  siteId: string,
): Promise<void> {
  await api.delete<ApiEnvelope<null>>(
    API_ENDPOINTS.CUSTOMERS.SITE_BY_ID(customerId, siteId),
  );
}

export async function setPrimaryCustomerSite(
  customerId: string,
  siteId: string,
): Promise<DeliverySite> {
  const { data } = await api.patch<ApiEnvelope<DeliverySite>>(
    API_ENDPOINTS.CUSTOMERS.SITE_PRIMARY(customerId, siteId),
    {},
  );
  return data.data;
}
