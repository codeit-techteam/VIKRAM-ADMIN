import {
  useWarehouseErpStore,
  type WarehouseErpState,
} from "@/store/warehouse-erp-store";

function useTransferListStoreHook<T>(
  selector: (state: WarehouseErpState) => T,
): T {
  return useWarehouseErpStore(selector);
}

export const useTransferListStore = Object.assign(useTransferListStoreHook, {
  getState: () => useWarehouseErpStore.getState(),
  setState: useWarehouseErpStore.setState,
  subscribe: useWarehouseErpStore.subscribe,
});

export { FLEET_DRIVERS, FLEET_VEHICLES } from "@/store/warehouse-erp-store";
