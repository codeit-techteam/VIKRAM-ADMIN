"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedHubState {
  selectedHubId: string | null;
  selectedHubName: string | null;
  setSelectedHub: (hubId: string | null, hubName?: string | null) => void;
  clearSelectedHub: () => void;
}

/**
 * Shared hub context for Sub-Hub Network ops pages
 * (Inventory, Requisitions, Transfers, Dispatch Logs).
 */
export const useSelectedHubStore = create<SelectedHubState>()(
  persist(
    (set) => ({
      selectedHubId: null,
      selectedHubName: null,
      setSelectedHub: (hubId, hubName = null) =>
        set({
          selectedHubId: hubId,
          selectedHubName: hubName,
        }),
      clearSelectedHub: () =>
        set({ selectedHubId: null, selectedHubName: null }),
    }),
    {
      name: "vikram-selected-hub",
      partialize: (state) => ({
        selectedHubId: state.selectedHubId,
        selectedHubName: state.selectedHubName,
      }),
    },
  ),
);
