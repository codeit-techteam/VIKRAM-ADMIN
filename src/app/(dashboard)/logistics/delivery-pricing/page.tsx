import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { DeliveryPricingPage } from "@/features/logistics/components/DeliveryPricingPage";

export const metadata: Metadata = {
  title: "Delivery Pricing",
};

export default function DeliveryPricingRoute() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Delivery Pricing"
        subtitle="Manage vehicle-wise delivery charges and distance slabs used across the Customer App."
        breadcrumbs={getNavBreadcrumbsFromPath("/logistics/delivery-pricing")}
      />
      <DeliveryPricingPage />
    </div>
  );
}
