"use client";

import type { HubPerformanceKpis } from "@/utils/hub-profile-metrics";

interface HubPerformanceStripProps {
  kpis: HubPerformanceKpis;
}

export function HubPerformanceStrip({ kpis }: HubPerformanceStripProps) {
  const items = [
    { label: "Today's Orders", value: kpis.todaysOrders },
    { label: "Today's Dispatches", value: kpis.todaysDispatches },
    { label: "Incoming Transfers", value: kpis.incomingTransfers },
    { label: "Pending Requisitions", value: kpis.pendingRequisitions },
  ] as const;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#1A1A1A]">
        Hub Performance
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-orange-50/40"
          >
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              {item.label}
            </p>
            <p className="mt-1.5 text-xl font-bold text-[#1A1A1A] tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
