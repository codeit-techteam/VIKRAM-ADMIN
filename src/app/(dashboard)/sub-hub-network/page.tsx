import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { SubHubNetworkDashboard } from "@/components/sub-hub/SubHubNetworkDashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "All Sub-Hubs",
};

export default function SubHubNetworkPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="All Sub-Hubs"
        subtitle="Monitor regional hub inventory, requisitions, and transfer health across the network."
        actions={
          <Button className="h-10 gap-2 px-4">
            <Plus className="size-4" />
            Add New Hub
          </Button>
        }
      />

      <SubHubNetworkDashboard />
    </div>
  );
}
