"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Package,
  ShoppingCart,
  Truck,
  UserCheck,
  UserPlus,
  Zap,
} from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuickActionItem } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

const iconMap = {
  building: Building2,
  "user-plus": UserPlus,
  "shopping-cart": ShoppingCart,
  "user-check": UserCheck,
  package: Package,
  truck: Truck,
} as const;

interface DashboardQuickActionsProps {
  actions: QuickActionItem[];
  isLoading?: boolean;
}

export function DashboardQuickActions({
  actions,
  isLoading,
}: DashboardQuickActionsProps) {
  return (
    <DashboardCard
      title="Quick Actions"
      titleIcon={<Zap className="text-primary size-4" aria-hidden="true" />}
      className="flex h-full flex-col"
      contentClassName={cn(
        "grid flex-1 gap-3",
        "grid-cols-2 auto-rows-fr",
        "sm:grid-cols-3 sm:grid-rows-2",
        "xl:grid-cols-2 xl:grid-rows-3",
      )}
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="min-h-[96px] rounded-xl xl:min-h-0"
            />
          ))
        : actions.map((action) => {
            const Icon = iconMap[action.iconName];

            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  "group relative flex h-full min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-gray-100 bg-linear-to-b from-white to-[#FAFBFC] px-3 py-4 text-center transition-all duration-200 xl:min-h-0",
                  "hover:border-primary/25 hover:from-primary/4 hover:to-primary/8 hover:shadow-md",
                  "focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none",
                  "active:scale-[0.98]",
                )}
              >
                <ArrowUpRight
                  className="text-primary absolute top-2.5 right-2.5 size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="bg-primary/10 text-primary ring-primary/5 group-hover:bg-primary flex size-11 items-center justify-center rounded-xl ring-1 transition-colors duration-200 group-hover:text-white">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-[13px] leading-snug font-medium text-[#1A1A1A]">
                  {action.label}
                </span>
              </Link>
            );
          })}
    </DashboardCard>
  );
}
