"use client";

import { useEffect, useMemo, useState } from "react";

import { CriticalRequisitionTable } from "@/components/warehouse/CriticalRequisitionTable";
import { InventoryActivityTable } from "@/components/warehouse/InventoryActivityTable";
import { QuickActions } from "@/components/warehouse/QuickActions";
import { WarehouseStatsCard } from "@/components/warehouse/WarehouseStatsCard";
import { getAvailableStock } from "@/mock/inventory";
import { quickActions } from "@/mock/warehouse-dashboard";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { LowStockItem } from "@/types/warehouse.types";

export function WarehouseDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const inventory = useWarehouseErpStore((state) => state.inventory);

  const stats = useMemo(
    () => useWarehouseErpStore.getState().getDashboardStats(),
    [requisitions, transfers, inventory],
  );

  const activities = useMemo(
    () => useWarehouseErpStore.getState().getInventoryActivities(),
    [transfers],
  );

  const criticalRequisitions = useMemo(
    () => useWarehouseErpStore.getState().getCriticalRequisitions(),
    [requisitions],
  );

  const lowStockAlerts = useMemo((): LowStockItem[] => {
    return inventory
      .filter((item) => getAvailableStock(item) <= item.minimumStock)
      .map((item) => {
        const available = getAvailableStock(item);
        const isCritical =
          available === 0 || available <= item.minimumStock * 0.5;

        return {
          id: item.id,
          productName: item.productName,
          currentStock: `${available} ${item.unit}`,
          minimumStock: `${item.minimumStock} ${item.unit}`,
          severity: isCritical ? ("critical" as const) : ("warning" as const),
        };
      });
  }, [inventory]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);

    return () => window.clearTimeout(timer);
  }, []);

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
        <QuickActions
          actions={quickActions}
          alerts={lowStockAlerts}
          isLoading={isLoading}
        />
      </div>

      <InventoryActivityTable activities={activities} isLoading={isLoading} />
    </div>
  );
}
