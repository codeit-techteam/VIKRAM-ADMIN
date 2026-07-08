import { useMemo } from "react";

import { erpLogToInventoryActivity } from "@/store/warehouse-erp-helpers";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { InventoryActivity } from "@/types/warehouse.types";

interface LogDispatchParams {
  transferId: string;
  material: string;
  quantity: string;
  warehouse: string;
  by?: string;
}

interface LogHubReceiptParams {
  transferId: string;
  material: string;
  quantity: string;
  hub: string;
  by?: string;
}

interface InventoryActivityCompat {
  activities: InventoryActivity[];
  logDispatchOut: (params: LogDispatchParams) => void;
  logHubReceipt: (params: LogHubReceiptParams) => void;
  resetActivities: () => void;
}

const noop = () => undefined;

export function useInventoryActivityStore<T>(
  selector: (state: InventoryActivityCompat) => T,
): T {
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);
  const resetDatabase = useWarehouseErpStore((state) => state.resetDatabase);

  const activities = useMemo(
    () => activityLogs.slice(0, 20).map(erpLogToInventoryActivity),
    [activityLogs],
  );

  const compat = useMemo<InventoryActivityCompat>(
    () => ({
      activities,
      logDispatchOut: noop,
      logHubReceipt: noop,
      resetActivities: resetDatabase,
    }),
    [activities, resetDatabase],
  );

  return selector(compat);
}
