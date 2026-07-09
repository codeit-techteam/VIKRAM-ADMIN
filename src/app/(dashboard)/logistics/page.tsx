import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { LogisticsDashboardPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Logistics Dashboard",
};

function NetworkStatusBadge() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
      <div className="relative flex size-2.5">
        <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-40" />
        <span className="bg-success relative inline-flex size-2.5 rounded-full" />
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
          Network Status
        </p>
        <p className="text-sm font-semibold text-[#1A1A1A]">
          All systems operational
        </p>
      </div>
      <Badge
        variant="secondary"
        className="bg-success/10 text-success ml-1 rounded-md text-[10px] font-semibold"
      >
        Live
      </Badge>
    </div>
  );
}

export default function LogisticsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Logistics Dashboard"
        subtitle="Command center for monitoring warehouse transfers, hub deliveries, fleet, and dispatch operations."
        actions={<NetworkStatusBadge />}
      />
      <LogisticsDashboardPage />
    </div>
  );
}
