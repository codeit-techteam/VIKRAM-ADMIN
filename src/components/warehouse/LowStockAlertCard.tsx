"use client";

import { AlertTriangle } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LowStockItem, LowStockSeverity } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface LowStockAlertCardProps {
  alerts: LowStockItem[];
  totalCount?: number;
  isLoading?: boolean;
}

const severityStyles: Record<LowStockSeverity, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-orange-100 text-orange-700",
};

function SeverityBadge({ severity }: { severity: LowStockSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
        severityStyles[severity],
      )}
    >
      {severity}
    </span>
  );
}

export function LowStockAlertCard({
  alerts,
  totalCount,
  isLoading,
}: LowStockAlertCardProps) {
  const displayCount = totalCount ?? alerts.length;

  return (
    <DashboardCard
      title="Low Stock Alerts"
      badge={
        !isLoading ? (
          <Badge className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100">
            {displayCount} items
          </Badge>
        ) : null
      }
      className="h-full"
      contentClassName="mt-4"
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No low stock alerts"
          description="All inventory levels are within acceptable ranges."
          icon={<AlertTriangle className="size-8" />}
        />
      ) : (
        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                  {alert.productName}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Current: {alert.currentStock} | Min: {alert.minimumStock}
                </p>
              </div>
              <SeverityBadge severity={alert.severity} />
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
