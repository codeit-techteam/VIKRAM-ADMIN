import type { Metadata } from "next";

import { DispatchControl } from "@/components/dispatch/DispatchControl";
import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";

export const metadata: Metadata = {
  title: "Dispatch Control",
};

export default function DispatchControlPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Control"
        subtitle="Manage and orchestrate outbound material dispatches for Mumbai Hub."
        breadcrumbs={getNavBreadcrumbsFromPath("/central-warehouse/dispatch")}
      />

      <DispatchControl />
    </div>
  );
}
