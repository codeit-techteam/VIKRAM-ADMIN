"use client";

import Link from "next/link";
import {
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  PackagePlus,
  Truck,
  Warehouse,
} from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  WarehouseQuickAction,
  WarehouseQuickActionIcon,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<WarehouseQuickActionIcon, LucideIcon> = {
  "receive-stock": PackagePlus,
  "approve-requisition": CheckCircle2,
  "allocate-inventory": ClipboardCheck,
  "create-transfer": ArrowRightLeft,
  "inventory-management": Warehouse,
  "dispatch-control": Truck,
};

interface QuickActionsProps {
  actions: WarehouseQuickAction[];
  isLoading?: boolean;
}

export function QuickActions({ actions, isLoading }: QuickActionsProps) {
  return (
    <DashboardCard
      title="Quick Actions"
      className="h-full [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:tracking-wider [&_h2]:text-gray-400 [&_h2]:uppercase"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[88px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = iconMap[action.icon];

            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  "hover:border-primary/20 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50/50 hover:shadow-md",
                )}
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
  );
}
