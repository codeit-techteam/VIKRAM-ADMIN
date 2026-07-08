"use client";

import type { HubPerformanceKpis } from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubPerformanceStripProps {
  kpis: HubPerformanceKpis;
}

export function HubPerformanceStrip({ kpis }: HubPerformanceStripProps) {
  const items = [
    { label: "Today's Orders", value: kpis.todaysOrders },
    { label: "Today's Dispatches", value: kpis.todaysDispatches },
    { label: "Incoming Transfers", value: kpis.incomingTransfers },
    { label: "Pending Requisitions", value: kpis.pendingRequisitions },
    {
      label: "Low Stock Alerts",
      value: kpis.lowStockAlerts,
      warn: kpis.lowStockAlerts > 0,
    },
    {
      label: "Inventory Health",
      value: `${kpis.inventoryHealth}%`,
      tone: kpis.inventoryHealthLabel,
    },
  ] as const;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#1A1A1A]">
        Hub Performance
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-orange-50/40"
          >
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              {item.label}
            </p>
            <p
              className={cn(
                "mt-1.5 text-xl font-bold tabular-nums",
                "warn" in item && item.warn
                  ? "text-orange-500"
                  : "tone" in item && item.tone === "critical"
                    ? "text-red-600"
                    : "tone" in item && item.tone === "warning"
                      ? "text-orange-500"
                      : "text-[#1A1A1A]",
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
