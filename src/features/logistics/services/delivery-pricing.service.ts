import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  DeliveryBenefitConfig,
  DeliveryPricingHistoryEntry,
  DeliveryPricingRule,
  DeliveryPricingStatus,
  DeliveryPricingSummary,
  DeliveryVehicleType,
  UpsertDeliveryPricingPayload,
} from "@/features/logistics/types/delivery-pricing.types";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getDeliveryPricingSummary(): Promise<DeliveryPricingSummary> {
  const { data } = await api.get<ApiEnvelope<DeliveryPricingSummary>>(
    API_ENDPOINTS.DELIVERY_PRICING.SUMMARY,
  );
  return data.data;
}

export async function listDeliveryPricingRules(params?: {
  vehicleType?: DeliveryVehicleType;
  status?: DeliveryPricingStatus;
}): Promise<DeliveryPricingRule[]> {
  const { data } = await api.get<ApiEnvelope<DeliveryPricingRule[]>>(
    API_ENDPOINTS.DELIVERY_PRICING.BASE,
    { params },
  );
  return data.data;
}

export async function getDeliveryBenefitConfig(): Promise<DeliveryBenefitConfig> {
  const { data } = await api.get<ApiEnvelope<DeliveryBenefitConfig>>(
    API_ENDPOINTS.DELIVERY_PRICING.BENEFIT_CONFIG,
  );
  return data.data;
}

export async function updateDeliveryBenefitConfig(payload: {
  firstBikeDeliveriesFree?: number;
  companyAbsorptionInr?: number;
  status?: DeliveryPricingStatus;
}): Promise<DeliveryBenefitConfig> {
  const { data } = await api.put<ApiEnvelope<DeliveryBenefitConfig>>(
    API_ENDPOINTS.DELIVERY_PRICING.BENEFIT_CONFIG,
    payload,
  );
  return data.data;
}

export async function createDeliveryPricingRule(
  payload: UpsertDeliveryPricingPayload & { vehicleType: DeliveryVehicleType },
): Promise<DeliveryPricingRule> {
  const { data } = await api.post<ApiEnvelope<DeliveryPricingRule>>(
    API_ENDPOINTS.DELIVERY_PRICING.BASE,
    payload,
  );
  return data.data;
}

export async function updateDeliveryPricingRule(
  id: string,
  payload: UpsertDeliveryPricingPayload,
): Promise<DeliveryPricingRule> {
  const { data } = await api.put<ApiEnvelope<DeliveryPricingRule>>(
    API_ENDPOINTS.DELIVERY_PRICING.BY_ID(id),
    payload,
  );
  return data.data;
}

export async function updateDeliveryPricingStatus(
  id: string,
  status: DeliveryPricingStatus,
  reason?: string,
): Promise<DeliveryPricingRule> {
  const { data } = await api.patch<ApiEnvelope<DeliveryPricingRule>>(
    API_ENDPOINTS.DELIVERY_PRICING.STATUS(id),
    { status, reason },
  );
  return data.data;
}

export async function getDeliveryPricingHistory(
  id: string,
): Promise<DeliveryPricingHistoryEntry[]> {
  const { data } = await api.get<ApiEnvelope<DeliveryPricingHistoryEntry[]>>(
    API_ENDPOINTS.DELIVERY_PRICING.HISTORY(id),
  );
  return data.data;
}
