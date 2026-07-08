import { create } from "zustand";

import { activities as SEED_ACTIVITIES } from "@/mock/warehouse-dashboard";
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

interface InventoryActivityState {
  activities: InventoryActivity[];
  logDispatchOut: (params: LogDispatchParams) => void;
  logHubReceipt: (params: LogHubReceiptParams) => void;
  resetActivities: () => void;
}

function formatActivityTime(date = new Date()): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const useInventoryActivityStore = create<InventoryActivityState>(
  (set) => ({
    activities: SEED_ACTIVITIES,

    logDispatchOut: ({
      transferId,
      material,
      quantity,
      warehouse,
      by = "Dispatch System",
    }) => {
      const entry: InventoryActivity = {
        id: `act-dispatch-${Date.now()}`,
        time: formatActivityTime(),
        activity: `Dispatch Out — ${transferId}`,
        material,
        quantity: `-${quantity}`,
        quantityChange: "negative",
        by,
        status: "verified",
      };
      set((state) => ({
        activities: [entry, ...state.activities],
      }));
      void warehouse;
    },

    logHubReceipt: ({
      transferId,
      material,
      quantity,
      hub,
      by = "Hub Manager",
    }) => {
      const entry: InventoryActivity = {
        id: `act-receipt-${Date.now()}`,
        time: formatActivityTime(),
        activity: `Hub Receipt — ${transferId}`,
        material,
        quantity: `+${quantity}`,
        quantityChange: "positive",
        by,
        status: "completed",
      };
      set((state) => ({
        activities: [entry, ...state.activities],
      }));
      void hub;
    },

    resetActivities: () => {
      set({ activities: SEED_ACTIVITIES });
    },
  }),
);
