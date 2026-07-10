"use client";

import Link from "next/link";
import {
  Building2,
  ShoppingCart,
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
      contentClassName="grid auto-rows-min grid-cols-2 gap-2.5"
    >
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[76px] rounded-xl" />
          ))
        : actions.map((action) => {
            const Icon = iconMap[action.iconName];

            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  "group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-[#FAFBFC] px-3 py-3 text-center transition-all duration-150",
                  "hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm",
                )}
              >
                <span className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-9 items-center justify-center rounded-lg transition-colors">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="text-xs leading-tight font-medium text-[#1A1A1A]">
                  {action.label}
                </span>
              </Link>
            );
          })}
    </DashboardCard>
  );
}
