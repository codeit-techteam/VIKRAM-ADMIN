"use client";

import { useEffect, useState } from "react";

import { CriticalRequisitionTable } from "@/components/warehouse/CriticalRequisitionTable";
import { InventoryActivityTable } from "@/components/warehouse/InventoryActivityTable";
import { LowStockAlertCard } from "@/components/warehouse/LowStockAlertCard";
import { QuickActions } from "@/components/warehouse/QuickActions";
import { WarehouseStatsCard } from "@/components/warehouse/WarehouseStatsCard";
import {
  activities,
  alerts,
  quickActions,
  requisitions,
  stats,
} from "@/mock/warehouse-dashboard";

export function WarehouseDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace simulated loading with warehouse dashboard API fetch
    const timer = window.setTimeout(() => setIsLoading(false), 600);

    return () => window.clearTimeout(timer);
  }, []);

  const lowStockCount = stats.find(
    (item) => item.id === "low-stock-items",
  )?.value;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <WarehouseStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <CriticalRequisitionTable
          requisitions={requisitions}
          isLoading={isLoading}
        />
        <QuickActions actions={quickActions} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <InventoryActivityTable activities={activities} isLoading={isLoading} />
        <LowStockAlertCard
          alerts={alerts}
          totalCount={
            typeof lowStockCount === "string"
              ? Number.parseInt(lowStockCount, 10)
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
