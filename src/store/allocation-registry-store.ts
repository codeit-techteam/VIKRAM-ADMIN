import { useMemo } from "react";

import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type {
  AllocationWorkflowResult,
  TransferListItem,
} from "@/types/warehouse.types";

interface AllocationRegistryCompat {
  allocations: AllocationWorkflowResult[];
  addAllocation: (result: AllocationWorkflowResult) => void;
  getAllocationById: (
    allocationId: string,
  ) => AllocationWorkflowResult | undefined;
  getTransferReadyAllocations: (
    transfers?: TransferListItem[],
  ) => AllocationWorkflowResult[];
}

function buildCompatState(): AllocationRegistryCompat {
  const state = useWarehouseErpStore.getState();
  return {
    allocations: state.allocations
      .filter((entry) => entry.status === "COMPLETED")
      .map((entry) => state.getAllocationById(entry.allocationId))
      .filter((entry): entry is AllocationWorkflowResult => Boolean(entry)),
    addAllocation: (result) => state.syncAllocationResult(result),
    getAllocationById: (allocationId) => state.getAllocationById(allocationId),
    getTransferReadyAllocations: () => state.getTransferReadyAllocations(),
  };
}

function useAllocationRegistryStoreHook<T>(
  selector: (state: AllocationRegistryCompat) => T,
): T {
  const erpAllocations = useWarehouseErpStore((state) => state.allocations);
  const getAllocationById = useWarehouseErpStore(
    (state) => state.getAllocationById,
  );
  const getTransferReadyAllocations = useWarehouseErpStore(
    (state) => state.getTransferReadyAllocations,
  );
  const syncAllocationResult = useWarehouseErpStore(
    (state) => state.syncAllocationResult,
  );

  const allocations = useMemo(
    () =>
      erpAllocations
        .filter((entry) => entry.status === "COMPLETED")
        .map((entry) => getAllocationById(entry.allocationId))
        .filter((entry): entry is AllocationWorkflowResult => Boolean(entry)),
    [erpAllocations, getAllocationById],
  );

  const compat = useMemo(
    () => ({
      allocations,
      addAllocation: syncAllocationResult,
      getAllocationById,
      getTransferReadyAllocations,
    }),
    [
      allocations,
      syncAllocationResult,
      getAllocationById,
      getTransferReadyAllocations,
    ],
  );

  return selector(compat);
}

export const useAllocationRegistryStore = Object.assign(
  useAllocationRegistryStoreHook,
  {
    getState: () => buildCompatState(),
    subscribe: useWarehouseErpStore.subscribe,
  },
);
