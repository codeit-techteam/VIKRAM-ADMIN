import { create } from "zustand";

import {
  getAllManagers,
  getManagerProfile,
  queryManagers,
} from "@/mock/sub-hub-manager-service";
import type {
  CreateManagerPayload,
  ManagerFilters,
  ManagerProfileDetail,
  ManagerQueryParams,
  ManagerQueryResult,
  SubHubManager,
  TransferHubPayload,
} from "@/features/user-management/types/sub-hub-manager.types";
import { MANAGER_HUBS } from "@/mock/sub-hub-manager-service";

interface SubHubManagerStoreState {
  managers: SubHubManager[];

  queryManagers: (params: ManagerQueryParams) => ManagerQueryResult;
  getManagerProfile: (managerId: string) => ManagerProfileDetail | null;
  searchManagers: (filters: ManagerFilters) => SubHubManager[];

  transferHub: (payload: TransferHubPayload) => void;
  createManager: (payload: CreateManagerPayload) => SubHubManager;
  deactivateManager: (managerId: string) => void;
  reactivateManager: (managerId: string) => void;
}

export const useSubHubManagerStore = create<SubHubManagerStoreState>(
  (set, get) => ({
    managers: getAllManagers(),

    queryManagers: (params) => {
      return queryManagers(get().managers, params);
    },

    getManagerProfile: (managerId) => {
      return getManagerProfile(managerId, get().managers);
    },

    searchManagers: (filters) => {
      return get().managers.filter((manager) => {
        if (filters.region !== "all" && manager.region !== filters.region) {
          return false;
        }
        if (filters.hubId !== "all" && manager.hubId !== filters.hubId) {
          return false;
        }
        if (filters.status !== "all" && manager.status !== filters.status) {
          return false;
        }
        if (
          filters.warehouse !== "all" &&
          manager.warehouse !== filters.warehouse
        ) {
          return false;
        }
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          return (
            manager.name.toLowerCase().includes(q) ||
            manager.employeeId.toLowerCase().includes(q) ||
            manager.hubName.toLowerCase().includes(q)
          );
        }
        return true;
      });
    },

    transferHub: (payload) => {
      const hub = MANAGER_HUBS.find((h) => h.hubId === payload.newHubId);
      if (!hub) return;

      set((state) => ({
        managers: state.managers.map((manager) =>
          manager.id === payload.managerId
            ? {
                ...manager,
                hubId: hub.hubId,
                hubName: hub.hubName,
                hubCode: hub.hubCode,
                warehouse: hub.warehouse,
                city: hub.city,
              }
            : manager,
        ),
      }));
    },

    createManager: (payload) => {
      const hub = MANAGER_HUBS.find((h) => h.hubId === payload.hubId);
      const allManagers = get().managers;
      const newId = `mgr-new-${Date.now()}`;

      const newManager: SubHubManager = {
        id: newId,
        employeeId: payload.employeeId,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        hubId: hub?.hubId ?? "",
        hubName: hub?.hubName ?? "",
        hubCode: hub?.hubCode ?? "",
        warehouse: payload.warehouse,
        region: payload.region,
        city: hub?.city ?? "",
        status: "ACTIVE",
        pendingRequisitions: 0,
        pendingDispatches: 0,
        todayOrders: 0,
        lowStockItems: 0,
        availableDrivers: 0,
        totalDrivers: 0,
        joiningDate: new Date().toISOString(),
      };

      set({ managers: [...allManagers, newManager] });
      return newManager;
    },

    deactivateManager: (managerId) => {
      set((state) => ({
        managers: state.managers.map((manager) =>
          manager.id === managerId
            ? { ...manager, status: "LEAVE" as const }
            : manager,
        ),
      }));
    },

    reactivateManager: (managerId) => {
      set((state) => ({
        managers: state.managers.map((manager) =>
          manager.id === managerId
            ? { ...manager, status: "ACTIVE" as const }
            : manager,
        ),
      }));
    },
  }),
);
