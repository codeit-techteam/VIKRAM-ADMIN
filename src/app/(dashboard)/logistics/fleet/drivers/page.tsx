import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { FleetDriversPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Fleet Management — Drivers",
};

export default function FleetDriversRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Fleet Management"
        subtitle="Manage drivers, vehicle assignments, and trip assignments."
        breadcrumbs={getNavBreadcrumbsFromPath("/logistics/fleet/drivers")}
      />
      <FleetDriversPage />
    </div>
  );
}
