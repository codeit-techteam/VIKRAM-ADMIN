import { create } from "zustand";

import {
  buildDraftTransfer,
  confirmTransferWorkflow,
  getDefaultFormValues,
} from "@/mock/transfer-workflow";
import { adminRequisitionsService } from "@/services/adminRequisitions";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { warehouseService } from "@/services/warehouse";
import { useTransferListStore } from "@/store/transfer-list-store";
import type {
  FleetDriver,
  FleetVehicle,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
  TransferWorkflowResult,
  TransferWorkflowStep,
} from "@/types/warehouse.types";
import { clearAllocationTransferContext } from "@/utils/allocation-transfer-bridge";

const STEP_TRANSITION_MS = 500;

function mapApiVehicleToFleet(v: {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  assignedHub: string;
  status: string;
}): FleetVehicle {
  const status =
    v.status === "available"
      ? "idle"
      : v.status === "maintenance"
        ? "maintenance"
        : v.status === "running" || v.status === "loading"
          ? "in-transit"
          : "assigned";

  return {
    id: v.id,
    vehicleNumber: v.vehicleNumber,
    vehicleType: v.vehicleType,
    capacityKg: v.capacityKg || 10000,
    location: v.assignedHub || "Central Warehouse",
    availability: status === "idle" ? "now" : "4hr",
    status,
  };
}

function mapApiDriverToFleet(d: {
  id: string;
  name: string;
  employeeId: string;
  mobile: string;
  status: string;
}): FleetDriver {
  const status =
    d.status === "available"
      ? "ready"
      : d.status === "on_leave" || d.status === "inactive"
        ? "leave"
        : "on-duty";

  return {
    id: d.id,
    name: d.name,
    employeeId: d.employeeId,
    licenseType: "LMV / HMV",
    experienceYears: 0,
    rating: 4.5,
    status,
    phone: d.mobile,
    avatarInitials: d.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

interface TransferWorkflowState {
  currentStep: TransferWorkflowStep;
  maxCompletedStep: number;
  isTransitioning: boolean;
  isSubmitting: boolean;
  transferId: string | null;
  context: TransferWorkflowContext | null;
  form: TransferWorkflowFormValues;
  result: TransferWorkflowResult | null;
  vehicles: FleetVehicle[];
  drivers: FleetDriver[];
  draftSaved: boolean;

  initializeFromContext: (context: TransferWorkflowContext) => boolean;
  loadFleet: () => Promise<void>;
  reset: () => void;
  updateForm: (values: Partial<TransferWorkflowFormValues>) => void;
  saveDraft: () => void;
  goNext: () => Promise<void>;
  goBack: () => Promise<void>;
  confirmTransfer: () => Promise<TransferWorkflowResult>;
}

export const useTransferWorkflowStore = create<TransferWorkflowState>(
  (set, get) => ({
    currentStep: 1,
    maxCompletedStep: 0,
    isTransitioning: false,
    isSubmitting: false,
    transferId: null,
    context: null,
    form: getDefaultFormValues(),
    result: null,
    vehicles: [],
    drivers: [],
    draftSaved: false,

    initializeFromContext: (context) => {
      const existingForAllocation = useTransferListStore
        .getState()
        .transfers.find(
          (transfer) => transfer.allocationId === context.allocationId,
        );

      if (existingForAllocation && existingForAllocation.status !== "DRAFT") {
        return false;
      }

      const existingDraft =
        existingForAllocation?.status === "DRAFT"
          ? existingForAllocation
          : undefined;

      // Prefer real transfer id (TRN- from REQ-) so detail page can load from API
      const transferId =
        existingDraft?.transferId ??
        context.requisitionId.replace(/^REQ-/, "TRN-");

      const form = getDefaultFormValues();

      set({
        currentStep: 1,
        maxCompletedStep: 0,
        isTransitioning: false,
        isSubmitting: false,
        transferId,
        context,
        form,
        result: null,
        draftSaved: false,
      });

      if (!existingDraft) {
        const draft = buildDraftTransfer(transferId, context, form);
        useTransferListStore.getState().addTransfer(draft);
      }

      void get().loadFleet();
      return true;
    },

    loadFleet: async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          vehiclesService.list({ page: 1, limit: 100, status: "AVAILABLE" }),
          driversService.list({ page: 1, limit: 100, status: "AVAILABLE" }),
        ]);
        set({
          vehicles: vehiclesRes.vehicles.map(mapApiVehicleToFleet),
          drivers: driversRes.drivers.map(mapApiDriverToFleet),
        });
      } catch {
        // Keep whatever is already in state; UI will show empty fleet
        set({ vehicles: get().vehicles, drivers: get().drivers });
      }
    },

    reset: () => {
      set({
        currentStep: 1,
        maxCompletedStep: 0,
        isTransitioning: false,
        isSubmitting: false,
        transferId: null,
        context: null,
        form: getDefaultFormValues(),
        result: null,
        vehicles: [],
        drivers: [],
        draftSaved: false,
      });
    },

    updateForm: (values) => {
      set((state) => ({
        form: { ...state.form, ...values },
      }));
    },

    saveDraft: () => {
      const { transferId, context, form } = get();
      if (!transferId || !context) return;

      const draft = buildDraftTransfer(transferId, context, form);
      useTransferListStore.getState().updateTransfer(transferId, draft);
      set({ draftSaved: true });
    },

    goNext: async () => {
      const state = get();
      const nextStep = Math.min(
        5,
        state.currentStep + 1,
      ) as TransferWorkflowStep;

      set({ isTransitioning: true });
      await new Promise((resolve) => setTimeout(resolve, STEP_TRANSITION_MS));

      set({
        currentStep: nextStep,
        maxCompletedStep: Math.max(state.maxCompletedStep, state.currentStep),
        isTransitioning: false,
      });
    },

    goBack: async () => {
      const state = get();
      if (state.currentStep <= 1) return;

      set({ isTransitioning: true });
      await new Promise((resolve) => setTimeout(resolve, STEP_TRANSITION_MS));

      set({
        currentStep: (state.currentStep - 1) as TransferWorkflowStep,
        isTransitioning: false,
      });
    },

    confirmTransfer: async () => {
      const state = get();
      const { transferId, context, form, vehicles, drivers } = state;

      if (!transferId || !context) {
        throw new Error("Transfer context is missing.");
      }
      if (!context.requisitionUuid) {
        throw new Error(
          "Requisition reference is missing. Re-open Create Transfer from a completed allocation.",
        );
      }
      if (!form.vehicleId || !form.driverId) {
        throw new Error("Assign both a vehicle and a driver before confirming.");
      }

      set({ isSubmitting: true });

      try {
        await adminRequisitionsService.assignLogistics(context.requisitionUuid, {
          vehicleId: form.vehicleId,
          driverId: form.driverId,
          expectedDispatchDate: form.dispatchDate || undefined,
          comment: form.logisticsRemarks || undefined,
        });

        // Persist ETA when provided
        if (form.expectedArrival) {
          try {
            await adminRequisitionsService.assignLogistics(
              context.requisitionUuid,
              {
                expectedDispatchDate: form.dispatchDate || undefined,
              },
            );
          } catch {
            // non-fatal — logistics already assigned
          }
        }

        const apiTransfer = await warehouseService.getTransfer(
          context.requisitionUuid,
        );

        const outcome = confirmTransferWorkflow(
          apiTransfer.transferId || transferId,
          context,
          form,
          vehicles,
          drivers,
        );

        // Prefer API-backed fields
        const transfer = {
          ...outcome.transfer,
          id: apiTransfer.id,
          transferId: apiTransfer.transferId,
          requisitionId: context.requisitionId,
          vehicleId: apiTransfer.vehicleId ?? form.vehicleId,
          vehicleNumber:
            apiTransfer.vehicleNumber ?? outcome.transfer.vehicleNumber,
          driverId: apiTransfer.driverId ?? form.driverId,
          assignedDriver: apiTransfer.assignedDriver
            ? {
                name: apiTransfer.assignedDriver.name,
                employeeId:
                  (apiTransfer.assignedDriver as { employeeId?: string })
                    .employeeId ??
                  form.driverId.slice(0, 8).toUpperCase(),
              }
            : outcome.transfer.assignedDriver,
          status: (apiTransfer.status as typeof outcome.transfer.status) ?? "TRANSFER_CREATED",
          eta: apiTransfer.eta || outcome.transfer.eta,
        };

        useTransferListStore
          .getState()
          .updateTransfer(transferId, transfer);
        // Also index under real transfer id if it changed
        if (transfer.transferId !== transferId) {
          useTransferListStore.getState().addTransfer(transfer);
        }

        clearAllocationTransferContext();

        const result: TransferWorkflowResult = {
          ...outcome.result,
          transferId: transfer.transferId,
          vehicleNumber: transfer.vehicleNumber,
          driverName: transfer.assignedDriver?.name,
        };

        set({
          transferId: transfer.transferId,
          result,
          maxCompletedStep: 5,
          currentStep: 5,
          isSubmitting: false,
        });

        return result;
      } catch (error) {
        set({ isSubmitting: false });
        throw error;
      }
    },
  }),
);
