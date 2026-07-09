import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { WarehouseLogisticsPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Warehouse Logistics",
};

export default function WarehouseLogisticsRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Warehouse Logistics"
        subtitle="Track stock movement from central warehouse to regional sub-hubs."
      />
      <WarehouseLogisticsPage />
    </div>
  );
}
