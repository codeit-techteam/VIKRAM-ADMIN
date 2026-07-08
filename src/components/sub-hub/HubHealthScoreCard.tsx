"use client";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { HubHealthScoreBar } from "@/components/sub-hub/HubHealthScoreBar";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { HubHealthBreakdown } from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubHealthScoreCardProps {
  breakdown: HubHealthBreakdown;
}

const GRADE_STYLES = {
  excellent: "bg-emerald-100 text-emerald-700",
  healthy: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
} as const;

const GRADE_LABELS = {
  excellent: "Excellent",
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
} as const;

const WEIGHTS = [
  { key: "inventoryHealth" as const, label: "Inventory Health", weight: "40%" },
  { key: "dispatchSla" as const, label: "Dispatch SLA", weight: "25%" },
  {
    key: "orderFulfillment" as const,
    label: "Order Fulfillment",
    weight: "20%",
  },
  {
    key: "transferAccuracy" as const,
    label: "Transfer Accuracy",
    weight: "10%",
  },
  {
    key: "requisitionResponse" as const,
    label: "Requisition Response Time",
    weight: "5%",
  },
];

export function HubHealthScoreCard({ breakdown }: HubHealthScoreCardProps) {
  return (
    <DashboardCard
      title="Hub Health Score"
      badge={
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
            GRADE_STYLES[breakdown.grade],
          )}
        >
          {GRADE_LABELS[breakdown.grade]}
        </span>
      }
      contentClassName="mt-5 space-y-5"
    >
      <div>
        <div className="mb-2 flex items-end justify-between gap-3">
          <p className="text-4xl font-bold text-[#1A1A1A] tabular-nums">
            {breakdown.score}
          </p>
          <p className="pb-1 text-sm text-[#64748B]">Composite score / 100</p>
        </div>
        <HubHealthScoreBar score={breakdown.score} showLabel={false} />
      </div>

      <ul className="space-y-4">
        {WEIGHTS.map((item) => (
          <li key={item.key}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="text-[#64748B]">
                {item.label}{" "}
                <span className="text-xs text-gray-400">({item.weight})</span>
              </span>
              <span className="font-semibold text-[#1A1A1A] tabular-nums">
                {breakdown[item.key]}%
              </span>
            </div>
            <ProgressBar value={breakdown[item.key]} showLabel={false} />
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
