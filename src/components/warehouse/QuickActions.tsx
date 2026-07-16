"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PackagePlus,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
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
  "group relative flex h-full min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-gray-100 bg-linear-to-b from-white to-[#FAFBFC] px-3 py-4 text-center transition-all duration-200",
  "hover:border-primary/25 hover:from-primary/4 hover:to-primary/8 hover:shadow-md",
  "focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none",
  "active:scale-[0.98]",
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
        titleIcon={<Zap className="text-primary size-4" aria-hidden="true" />}
        className="h-full"
        contentClassName="mt-5"
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
              const content = (
                <>
                  <ArrowUpRight
                    className="text-primary absolute top-2.5 right-2.5 size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <span className="bg-primary/10 text-primary ring-primary/5 group-hover:bg-primary flex size-10 items-center justify-center rounded-xl ring-1 transition-colors duration-200 group-hover:text-white">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[13px] leading-snug font-medium text-[#1A1A1A]">
                    {action.label}
                  </span>
                </>
              );

              if (action.id === "view-alerts") {
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setAlertsOpen(true)}
                    className={actionButtonClassName}
                  >
                    {content}
                    {alerts.length > 0 ? (
                      <span className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {alerts.length > 9 ? "9+" : alerts.length}
                      </span>
                    ) : null}
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
                  {content}
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertsOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              render={
                <Link
                  href={`${ROUTES.CENTRAL_WAREHOUSE}/inventory?alert=low-stock`}
                />
              }
              className="w-full sm:w-auto"
            >
              Open Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
