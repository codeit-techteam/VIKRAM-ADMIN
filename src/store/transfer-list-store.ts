import { create } from "zustand";

import { TRANSFER_LIST } from "@/mock/transfers";
import type { TransferListItem } from "@/types/warehouse.types";

interface TransferListState {
  transfers: TransferListItem[];
  addTransfer: (transfer: TransferListItem) => void;
  updateTransfer: (
    transferId: string,
    updates: Partial<TransferListItem>,
  ) => void;
  getPendingDispatchTransfers: () => TransferListItem[];
  resetTransfers: () => void;
}

export const useTransferListStore = create<TransferListState>((set, get) => ({
  transfers: TRANSFER_LIST,

  addTransfer: (transfer) => {
    set((state) => ({
      transfers: [transfer, ...state.transfers],
    }));
  },

  updateTransfer: (transferId, updates) => {
    set((state) => ({
      transfers: state.transfers.map((transfer) =>
        transfer.transferId === transferId
          ? { ...transfer, ...updates }
          : transfer,
      ),
    }));
  },

  getPendingDispatchTransfers: () => {
    const pendingStatuses = new Set<TransferListItem["status"]>([
      "PENDING_DISPATCH",
      "CREATED",
      "VEHICLE_ASSIGNED",
      "DRIVER_ASSIGNED",
      "READY",
    ]);
    return get().transfers.filter((transfer) =>
      pendingStatuses.has(transfer.status),
    );
  },

  resetTransfers: () => {
    set({ transfers: TRANSFER_LIST });
  },
}));
