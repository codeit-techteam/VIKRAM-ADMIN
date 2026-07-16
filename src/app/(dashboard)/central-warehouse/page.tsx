import type { Metadata } from "next";

import { WarehouseDashboard } from "@/components/warehouse/WarehouseDashboard";
import { WarehouseDashboardHeader } from "@/components/warehouse/WarehouseDashboardHeader";

export const metadata: Metadata = {
  title: "Warehouse Dashboard",
};

export default function CentralWarehousePage() {
  return (
    <div className="space-y-5">
      <WarehouseDashboardHeader />
      <WarehouseDashboard />
    </div>
  );
}
