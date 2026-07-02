import { Calendar, Download } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { QuickDispatchFAB } from "@/components/shared/QuickDispatchFAB";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { LowStockAlertCard } from "@/features/dashboard/components/LowStockAlertCard";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { SubHubStatusCard } from "@/features/dashboard/components/SubHubStatusCard";
import {
  LOW_STOCK_ITEMS,
  RECENT_ORDERS,
  REVENUE_DATA,
  REVENUE_HIGHLIGHT_INDEX,
  STAT_CARDS,
  SUB_HUB_STATUSES,
} from "@/features/dashboard/constants/dashboard.mock";

export const metadata: Metadata = {
  title: "Executive Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time procurement & logistics intelligence across India."
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Calendar className="size-4" />
              This Quarter
            </Button>
            <Button className="h-10 gap-2 bg-[#1A1A1A] px-4 text-white hover:bg-[#1A1A1A]/90">
              <Download className="size-4" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            valueVariant={card.valueVariant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueTrendChart
            data={REVENUE_DATA}
            highlightIndex={REVENUE_HIGHLIGHT_INDEX}
          />
        </div>
        <SubHubStatusCard hubs={SUB_HUB_STATUSES} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={RECENT_ORDERS} />
        </div>
        <LowStockAlertCard items={LOW_STOCK_ITEMS} />
      </div>

      <QuickDispatchFAB />
    </div>
  );
}
