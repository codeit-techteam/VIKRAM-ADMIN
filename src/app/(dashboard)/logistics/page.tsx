import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { LogisticsDashboardPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Logistics Dashboard",
};

function formatOperationalDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LogisticsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Logistics Dashboard"
        subtitle="Command center for monitoring warehouse transfers, hub deliveries, fleet, and dispatch operations."
        actions={
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
              Network Status
            </p>
            <p className="text-primary mt-0.5 text-lg font-bold">
              {formatOperationalDate(new Date())}
            </p>
          </div>
        }
      />
      <LogisticsDashboardPage />
    </div>
  );
}
