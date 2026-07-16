import { create } from "zustand";

import {
  getAllManagers,
  getManagerProfile,
  queryManagers,
  MANAGER_HUBS,
} from "@/mock/sub-hub-manager-service";
import { SUB_HUBS } from "@/mock/sub-hubs";
import type {
  CreateManagerPayload,
  ManagerFilters,
  ManagerProfileDetail,
  ManagerQueryParams,
  ManagerQueryResult,
  SubHubManager,
  TransferHubPayload,
} from "@/features/user-management/types/sub-hub-manager.types";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import type { CreateManagerResult } from "@/features/user-management/types/manager-onboarding.types";
import { getHubById, HUB_ASSIGNMENT_DATA } from "@/mock/manager-onboarding";

interface SubHubManagerStoreState {
  managers: SubHubManager[];

  queryManagers: (params: ManagerQueryParams) => ManagerQueryResult;
  getManagerProfile: (managerId: string) => ManagerProfileDetail | null;
  searchManagers: (filters: ManagerFilters) => SubHubManager[];

  transferHub: (payload: TransferHubPayload) => void;
  createManager: (payload: CreateManagerPayload) => SubHubManager;
  createManagerFromDraft: (
    draft: ManagerOnboardingSchema,
  ) => CreateManagerResult;
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
        if (filters.status !== "all") {
          if (filters.status === "NEED_ATTENTION") {
            const needsAttention =
              manager.pendingRequisitions > 5 ||
              manager.lowStockItems > 10 ||
              manager.pendingDispatches > 15;
            if (!needsAttention) return false;
          } else if (manager.status !== filters.status) {
            return false;
          }
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
      const networkHub = SUB_HUBS.find((h) => h.id === payload.newHubId);
      if (!hub && !networkHub) return;

      const hubId = hub?.hubId ?? networkHub!.id;
      const hubName = hub?.hubName ?? networkHub!.name;
      const hubCode = hub?.hubCode ?? networkHub!.nodeId;
      const city = hub?.city ?? networkHub!.city;
      const warehouse =
        hub?.warehouse ??
        (networkHub ? `${networkHub.city} Regional Warehouse` : "");
      const region = networkHub?.region;

      set((state) => ({
        managers: state.managers.map((manager) =>
          manager.id === payload.managerId
            ? {
                ...manager,
                hubId,
                hubName,
                hubCode,
                warehouse,
                city,
                ...(region ? { region } : {}),
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

    createManagerFromDraft: (draft) => {
      const hubData = getHubById(draft.hub);
      const regionData = HUB_ASSIGNMENT_DATA.regions.find(
        (r) => r.id === draft.region,
      );
      const cityData = HUB_ASSIGNMENT_DATA.cities.find(
        (c) => c.id === draft.city,
      );
      const warehouseData = HUB_ASSIGNMENT_DATA.warehouses.find(
        (w) => w.id === draft.warehouse,
      );
      const allManagers = get().managers;
      const newId = `mgr-new-${Date.now()}`;

      const newManager: SubHubManager = {
        id: newId,
        employeeId: draft.employeeId,
        name: draft.fullName,
        photo: draft.profilePhoto ?? undefined,
        phone: `+91 ${draft.phone}`,
        email: draft.email,
        hubId: draft.hub,
        hubName: hubData?.name ?? draft.hubName,
        hubCode: hubData?.code ?? draft.hubCode,
        warehouse: warehouseData?.name ?? "",
        region: regionData?.name ?? "",
        city: cityData?.name ?? "",
        status: "ACTIVE",
        pendingRequisitions: hubData?.pendingRequisitions ?? 0,
        pendingDispatches: hubData?.pendingDispatches ?? 0,
        todayOrders: 0,
        lowStockItems: 0,
        availableDrivers: 0,
        totalDrivers: 0,
        joiningDate: draft.joiningDate || new Date().toISOString(),
      };

      set({ managers: [...allManagers, newManager] });

      return {
        id: newId,
        employeeId: draft.employeeId,
        name: draft.fullName,
        hubName: newManager.hubName,
        hubCode: newManager.hubCode,
        username: draft.username,
        credentialsSent: draft.sendWelcomeEmail || draft.sendSms,
      };
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
