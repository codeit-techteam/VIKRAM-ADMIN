"use client";

import { useEffect, useState } from "react";

import { StatCard } from "@/components/shared/StatCard";
import { CriticalPendingActions } from "@/features/dashboard/components/CriticalPendingActions";
import { DashboardQuickActions } from "@/features/dashboard/components/DashboardQuickActions";
import { NotificationCenter } from "@/features/dashboard/components/NotificationCenter";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import {
  DASHBOARD_NOTIFICATIONS,
  PENDING_ACTIONS,
  QUICK_ACTIONS,
  RECENT_ORDERS,
  STAT_CARDS,
} from "@/features/dashboard/constants/dashboard.mock";

export function OperationsDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            valueVariant={card.valueVariant}
            href={card.href}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CriticalPendingActions
            actions={PENDING_ACTIONS}
            isLoading={isLoading}
          />
        </div>
        <DashboardQuickActions actions={QUICK_ACTIONS} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={RECENT_ORDERS} isLoading={isLoading} />
        </div>
        <NotificationCenter
          notifications={DASHBOARD_NOTIFICATIONS}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
