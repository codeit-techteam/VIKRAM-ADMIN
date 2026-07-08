import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AllocationWorkflowResult,
  TransferListItem,
} from "@/types/warehouse.types";

const SEED_ALLOCATIONS: AllocationWorkflowResult[] = [
  {
    allocationId: "ALC-9578",
    requestId: "REQ-9404-IN",
    destinationHub: "Manesar Plant",
    quantity: 314,
    unit: "Bags",
    material: "PPC Cement (43 Grade)",
    warehouseName: "Central Warehouse - Sector 62",
    batchLabel: "Batch B-2024",
    warehouseRemaining: 950,
    baseWeight: 15700,
    status: "COMPLETED",
    inventoryReserved: true,
  },
  {
    allocationId: "ALC-9821",
    requestId: "REQ-8812",
    destinationHub: "Gurgaon North",
    quantity: 450,
    unit: "Bundles",
    material: "TMT Steel Rods (12mm)",
    warehouseName: "Central Warehouse - Sector 62",
    batchLabel: "Batch A-2024",
    warehouseRemaining: 1200,
    baseWeight: 5400,
    status: "COMPLETED",
    inventoryReserved: true,
  },
  {
    allocationId: "ALC-9104",
    requestId: "REQ-8756",
    destinationHub: "Noida Sector 62",
    quantity: 300,
    unit: "Bags",
    material: "UltraTech Cement (OPC 53 Grade)",
    warehouseName: "Noida Central Warehouse",
    batchLabel: "Batch C-118",
    warehouseRemaining: 800,
    baseWeight: 15000,
    status: "COMPLETED",
    inventoryReserved: true,
  },
];

interface AllocationRegistryState {
  allocations: AllocationWorkflowResult[];
  addAllocation: (result: AllocationWorkflowResult) => void;
  getAllocationById: (
    allocationId: string,
  ) => AllocationWorkflowResult | undefined;
  getTransferReadyAllocations: (
    transfers: TransferListItem[],
  ) => AllocationWorkflowResult[];
}

function hasExistingTransfer(
  allocationId: string,
  transfers: TransferListItem[],
): boolean {
  return transfers.some((transfer) => transfer.allocationId === allocationId);
}

export const useAllocationRegistryStore = create<AllocationRegistryState>()(
  persist(
    (set, get) => ({
      allocations: SEED_ALLOCATIONS,

      addAllocation: (result) => {
        set((state) => {
          const enriched: AllocationWorkflowResult = {
            ...result,
            status: "COMPLETED",
            inventoryReserved: true,
          };
          const exists = state.allocations.some(
            (entry) => entry.allocationId === enriched.allocationId,
          );

          if (exists) {
            return {
              allocations: state.allocations.map((entry) =>
                entry.allocationId === enriched.allocationId ? enriched : entry,
              ),
            };
          }

          return {
            allocations: [enriched, ...state.allocations],
          };
        });
      },

      getAllocationById: (allocationId) =>
        get().allocations.find((entry) => entry.allocationId === allocationId),

      getTransferReadyAllocations: (transfers) =>
        get().allocations.filter(
          (allocation) =>
            allocation.status === "COMPLETED" &&
            allocation.inventoryReserved &&
            !hasExistingTransfer(allocation.allocationId, transfers),
        ),
    }),
    {
      name: "bq-allocation-registry",
    },
  ),
);
