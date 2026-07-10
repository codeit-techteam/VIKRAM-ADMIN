"use client";

import { useEffect, useMemo, useState } from "react";

import { StatCard } from "@/components/shared/StatCard";
import { CriticalPendingActions } from "@/features/dashboard/components/CriticalPendingActions";
import { DashboardQuickActions } from "@/features/dashboard/components/DashboardQuickActions";
import { NotificationCenter } from "@/features/dashboard/components/NotificationCenter";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import type { DashboardDateFilter } from "@/mock/executive-dashboard";
import { fetchExecutiveDashboardData } from "@/mock/executive-dashboard";

interface OperationsDashboardProps {
  dateFilter?: DashboardDateFilter;
}

export function OperationsDashboard({
  dateFilter = { range: "quarter" },
}: OperationsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  const dashboardData = useMemo(
    () => fetchExecutiveDashboardData(dateFilter),
    [dateFilter],
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [dateFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            valueVariant={card.valueVariant}
            href={card.href}
            icon={card.icon}
            iconContainerClassName={card.iconContainerClassName}
            iconClassName={card.iconClassName}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CriticalPendingActions
            actions={dashboardData.pendingActions}
            isLoading={isLoading}
          />
        </div>
        <DashboardQuickActions
          actions={dashboardData.quickActions}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersTable
            orders={dashboardData.recentOrders}
            isLoading={isLoading}
          />
        </div>
        <NotificationCenter
          notifications={dashboardData.notifications}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
