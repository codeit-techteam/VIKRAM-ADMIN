import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ShipmentTrackingPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Shipment Tracking",
};

export default function ShipmentTrackingRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Shipment Tracking"
        subtitle="Timeline-based tracker for warehouse transfers and customer deliveries."
        breadcrumbs={getNavBreadcrumbsFromPath("/logistics/tracking")}
      />
      <ShipmentTrackingPage />
    </div>
  );
}
