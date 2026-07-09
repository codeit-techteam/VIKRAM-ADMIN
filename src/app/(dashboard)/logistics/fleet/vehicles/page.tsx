import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { FleetVehiclesPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Fleet Management — Vehicles",
};

export default function FleetVehiclesRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Fleet Management"
        subtitle="Manage vehicles, assignments, and fleet availability across the network."
      />
      <FleetVehiclesPage />
    </div>
  );
}
