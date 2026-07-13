import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { SubHubNetworkDashboard } from "@/components/sub-hub/SubHubNetworkDashboard";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "All Sub-Hubs",
};

export default function SubHubNetworkPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="All Sub-Hubs"
        subtitle="Operations control tower for warehouse-to-hub-to-customer supply chain visibility."
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network")}
        actions={
          <Button
            className="h-10 gap-2 px-4"
            render={<Link href={ROUTES.SUB_HUB_ADD} />}
          >
            <Plus className="size-4" />
            Add New Hub
          </Button>
        }
      />

      <SubHubNetworkDashboard />
    </div>
  );
}
