import {
  deliveryPromotionsService,
  toUiDeliveryPromotion,
  type CreateDeliveryPromotionInput,
} from "@/services/cms-delivery-promotions.service";
import type { DeliveryPromotion } from "@/features/cms/types/delivery-promotion.types";

export async function getDeliveryPromotions(): Promise<DeliveryPromotion[]> {
  const rows = await deliveryPromotionsService.list();
  return rows.map(toUiDeliveryPromotion);
}

export async function createDeliveryPromotion(
  payload: CreateDeliveryPromotionInput,
): Promise<DeliveryPromotion> {
  const row = await deliveryPromotionsService.create(payload);
  return toUiDeliveryPromotion(row);
}

export async function updateDeliveryPromotion(
  id: string,
  payload: Partial<CreateDeliveryPromotionInput>,
): Promise<DeliveryPromotion> {
  const row = await deliveryPromotionsService.update(id, payload);
  return toUiDeliveryPromotion(row);
}

export async function deleteDeliveryPromotion(id: string): Promise<void> {
  await deliveryPromotionsService.remove(id);
}

export async function activateDeliveryPromotion(
  id: string,
): Promise<DeliveryPromotion> {
  const row = await deliveryPromotionsService.publish(id);
  return toUiDeliveryPromotion(row);
}

export async function deactivateDeliveryPromotion(
  id: string,
): Promise<DeliveryPromotion> {
  const row = await deliveryPromotionsService.unpublish(id);
  return toUiDeliveryPromotion(row);
}
