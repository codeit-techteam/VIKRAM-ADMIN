"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PackagePlus,
  Truck,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  LowStockItem,
  LowStockSeverity,
  WarehouseQuickAction,
  WarehouseQuickActionIcon,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const iconMap: Record<WarehouseQuickActionIcon, LucideIcon> = {
  "receive-stock": PackagePlus,
  "approve-requisition": CheckCircle2,
  "allocate-inventory": ClipboardCheck,
  "create-transfer": ArrowRightLeft,
  "inventory-management": Warehouse,
  "dispatch-control": Truck,
  "view-alerts": Bell,
  "hub-receiving": PackageCheck,
};

const severityStyles: Record<LowStockSeverity, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-orange-100 text-orange-700",
};

const actionButtonClassName = cn(
  "hover:border-primary/20 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50/50 hover:shadow-md",
);

interface QuickActionsProps {
  actions: WarehouseQuickAction[];
  alerts?: LowStockItem[];
  isLoading?: boolean;
}

export function QuickActions({
  actions,
  alerts = [],
  isLoading,
}: QuickActionsProps) {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <>
      <DashboardCard
        title="Quick Actions"
        className="h-full [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:tracking-wider [&_h2]:text-gray-400 [&_h2]:uppercase"
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[88px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = iconMap[action.icon];

              if (action.id === "view-alerts") {
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setAlertsOpen(true)}
                    className={actionButtonClassName}
                  >
                    <Icon className="text-primary size-5" strokeWidth={1.75} />
                    <span className="text-xs leading-tight font-medium text-[#1A1A1A]">
                      {action.label}
                    </span>
                  </button>
                );
              }

              if (!action.href) {
                return null;
              }

              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={actionButtonClassName}
                >
                  <Icon className="text-primary size-5" strokeWidth={1.75} />
                  <span className="text-xs leading-tight font-medium text-[#1A1A1A]">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </DashboardCard>

      <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Low Stock Alerts
              <Badge className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                {alerts.length} items
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Materials that need replenishment at the central warehouse.
            </DialogDescription>
          </DialogHeader>

          {alerts.length === 0 ? (
            <EmptyState
              title="No low stock alerts"
              description="All inventory levels are within acceptable ranges."
              icon={<AlertTriangle className="size-8" />}
            />
          ) : (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                      {alert.productName}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Current: {alert.currentStock} | Min: {alert.minimumStock}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                      severityStyles[alert.severity],
                    )}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
