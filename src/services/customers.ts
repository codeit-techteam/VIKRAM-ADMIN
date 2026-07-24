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
  membership: string | null;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  orders: number;
  wallet: { balance: number; tier: string | null };
  addresses: number;
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
    tier?: string;
  } | null;
  memberships: Array<{
    id: string;
    status: string;
    expiryDate: string;
    plan: { id: string; name: string };
  }>;
  orders: unknown[];
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function fetchAdminCustomers(params?: {
  search?: string;
  status?: string;
  membership?: string;
  page?: number;
  limit?: number;
}): Promise<AdminCustomersListResponse> {
  const { data } = await api.get<ApiEnvelope<AdminCustomersListResponse>>(
    API_ENDPOINTS.CUSTOMERS.BASE,
    { params },
  );
  return data.data;
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

export async function upgradeAdminCustomerMembership(
  id: string,
  payload: { planId?: string; planName?: string },
) {
  const { data } = await api.post<ApiEnvelope<AdminCustomerDetail>>(
    API_ENDPOINTS.CUSTOMERS.UPGRADE_MEMBERSHIP(id),
    payload,
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
