"use client";

import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Package,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/DashboardCard";
import type { OperationsAlert } from "@/types/erp.types";
import { cn } from "@/lib/utils";

const alertIcons: Record<string, typeof AlertTriangle> = {
  "low-stock-hubs": Package,
  "pending-allocations": Warehouse,
  "pending-dispatches": Truck,
  "delayed-transfers": AlertTriangle,
  "driver-pending": User,
  "vehicle-pending": Truck,
  "critical-orders": ClipboardList,
};

interface OperationsAlertsPanelProps {
  alerts: OperationsAlert[];
  isLoading?: boolean;
}

export function OperationsAlertsPanel({
  alerts,
  isLoading,
}: OperationsAlertsPanelProps) {
  return (
    <DashboardCard title="Needs Attention" contentClassName="mt-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`alert-skeleton-${index}`}
              className="h-14 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          All operations are running smoothly. No alerts at this time.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.id] ?? AlertTriangle;
            const isCritical = alert.severity === "critical";
            const isWarning = alert.severity === "warning";

            return (
              <li key={alert.id}>
                <Link
                  href={alert.href}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                    isCritical
                      ? "border-red-100 bg-red-50/60 hover:bg-red-50"
                      : isWarning
                        ? "border-orange-100 bg-orange-50/50 hover:bg-orange-50"
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        isCritical
                          ? "bg-red-100 text-red-600"
                          : isWarning
                            ? "bg-orange-100 text-orange-600"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">
                        {alert.label}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {alert.count} item{alert.count === 1 ? "" : "s"} need
                        action
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-[#64748B] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
