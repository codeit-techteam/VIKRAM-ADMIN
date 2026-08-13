import type { Metadata } from "next";

import { DeliveryPromotionPageContent } from "@/features/cms/components/DeliveryPromotionPageContent";

export const metadata: Metadata = {
  title: "Delivery Promotion",
};

export default function DeliveryPromotionPage() {
  return <DeliveryPromotionPageContent />;
}
