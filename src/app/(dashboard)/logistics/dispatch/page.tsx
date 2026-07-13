import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { RouteDispatchPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Route & Dispatch",
};

export default function RouteDispatchRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Route & Dispatch"
        subtitle="Plan and manage dispatch operations across the logistics network."
        breadcrumbs={getNavBreadcrumbsFromPath("/logistics/dispatch")}
      />
      <RouteDispatchPage />
    </div>
  );
}
