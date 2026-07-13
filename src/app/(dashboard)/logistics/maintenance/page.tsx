import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { MaintenancePage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Maintenance",
};

export default function MaintenanceRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Maintenance"
        subtitle="Track vehicle maintenance schedules, repairs, and service completions."
        breadcrumbs={getNavBreadcrumbsFromPath("/logistics/maintenance")}
      />
      <MaintenancePage />
    </div>
  );
}
