import { Calendar, Plus } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { WarehouseDashboard } from "@/components/warehouse/WarehouseDashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Warehouse Dashboard",
};

export default function CentralWarehousePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Warehouse Dashboard"
        subtitle="Live monitoring of operations at the Noida Central Hub."
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Calendar className="size-4" />
              Oct 24, 2023
            </Button>
            <Button className="h-10 gap-2 px-4">
              <Plus className="size-4" />
              New Requisition
            </Button>
          </>
        }
      />

      <WarehouseDashboard />
    </div>
  );
}
