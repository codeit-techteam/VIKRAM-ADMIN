"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { buttonVariants } from "@/components/ui/button";
import type { HubStockAlert } from "@/utils/hub-profile-metrics";
import { getRaiseRequisitionHref } from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubStockAlertsPanelProps {
  hubId: string;
  alerts: HubStockAlert[];
}

export function HubStockAlertsPanel({
  hubId,
  alerts,
}: HubStockAlertsPanelProps) {
  return (
    <DashboardCard
      title="Stock Alerts"
      badge={
        alerts.length > 0 ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-red-700 uppercase">
            {alerts.length} Critical
          </span>
        ) : undefined
      }
      contentClassName="mt-4"
    >
      {alerts.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          No critical stock alerts for this hub.
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.materialId}
              className="rounded-xl border border-red-100 bg-red-50/40 p-4 transition-colors hover:bg-red-50/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1A1A1A]">
                      {alert.materialName}
                    </p>
                    <p className="text-xs text-[#64748B]">{alert.sku}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                  Critically Low
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Stat
                  label="Current"
                  value={`${alert.currentQty} ${alert.unit}`}
                />
                <Stat
                  label="Safety Stock"
                  value={`${alert.safetyStock} ${alert.unit}`}
                />
                <Stat
                  label="Reorder"
                  value={`${alert.reorderLevel} ${alert.unit}`}
                />
                <Stat
                  label="Recommended"
                  value={`${alert.recommendedQty} ${alert.unit}`}
                />
              </dl>

              <Link
                href={getRaiseRequisitionHref(hubId, alert.materialId)}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "mt-3 w-full bg-[#1A1A1A] text-white hover:bg-[#333]",
                )}
              >
                Raise Requisition
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-[#1A1A1A] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
