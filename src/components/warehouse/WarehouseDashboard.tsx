"use client";

import { useEffect, useMemo, useState } from "react";

import { CriticalRequisitionTable } from "@/components/warehouse/CriticalRequisitionTable";
import { InventoryActivityTable } from "@/components/warehouse/InventoryActivityTable";
import { LowStockAlertCard } from "@/components/warehouse/LowStockAlertCard";
import { QuickActions } from "@/components/warehouse/QuickActions";
import { WarehouseStatsCard } from "@/components/warehouse/WarehouseStatsCard";
import { getAvailableStock } from "@/mock/inventory";
import { alerts, quickActions } from "@/mock/warehouse-dashboard";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";

export function WarehouseDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const inventory = useWarehouseErpStore((state) => state.inventory);
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);

  const stats = useMemo(
    () => useWarehouseErpStore.getState().getDashboardStats(),
    [requisitions, transfers, inventory],
  );

  const activities = useMemo(
    () => useWarehouseErpStore.getState().getInventoryActivities(),
    [activityLogs],
  );

  const criticalRequisitions = useMemo(
    () => useWarehouseErpStore.getState().getCriticalRequisitions(),
    [requisitions],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);

    return () => window.clearTimeout(timer);
  }, []);

  const lowStockCount = useMemo(
    () =>
      inventory.filter((item) => getAvailableStock(item) <= item.minimumStock)
        .length,
    [inventory],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <WarehouseStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <CriticalRequisitionTable
          requisitions={criticalRequisitions}
          isLoading={isLoading}
        />
        <QuickActions actions={quickActions} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <InventoryActivityTable activities={activities} isLoading={isLoading} />
        <LowStockAlertCard
          alerts={alerts}
          totalCount={lowStockCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
