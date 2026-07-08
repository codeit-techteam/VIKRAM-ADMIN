import { create } from "zustand";

import { FLEET_DRIVERS, FLEET_VEHICLES } from "@/mock/transfer-fleet";
import {
  buildDraftTransfer,
  confirmTransferWorkflow,
  generateTransferId,
  getDefaultFormValues,
} from "@/mock/transfer-workflow";
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
    vehicles: FLEET_VEHICLES,
    drivers: FLEET_DRIVERS,
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

      if (existingDraft) {
        set({
          currentStep: 1,
          maxCompletedStep: 0,
          isTransitioning: false,
          isSubmitting: false,
          transferId: existingDraft.transferId,
          context,
          form: getDefaultFormValues(),
          result: null,
          vehicles: FLEET_VEHICLES,
          drivers: FLEET_DRIVERS,
          draftSaved: false,
        });
        return true;
      }

      const transferId = generateTransferId();
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
        vehicles: FLEET_VEHICLES,
        drivers: FLEET_DRIVERS,
        draftSaved: false,
      });

      const draft = buildDraftTransfer(transferId, context, form);
      useTransferListStore.getState().addTransfer(draft);
      return true;
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
        vehicles: FLEET_VEHICLES,
        drivers: FLEET_DRIVERS,
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

      set({
        isTransitioning: true,
        maxCompletedStep: Math.max(state.maxCompletedStep, state.currentStep),
      });

      await new Promise((resolve) => setTimeout(resolve, STEP_TRANSITION_MS));
      set({ currentStep: nextStep, isTransitioning: false });
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

      set({ isSubmitting: true });

      try {
        await new Promise((resolve) => setTimeout(resolve, 700));

        const outcome = confirmTransferWorkflow(
          transferId,
          context,
          form,
          vehicles,
          drivers,
        );

        useTransferListStore
          .getState()
          .updateTransfer(transferId, outcome.transfer);

        clearAllocationTransferContext();

        set({
          result: outcome.result,
          vehicles: outcome.vehicles,
          drivers: outcome.drivers,
          maxCompletedStep: 5,
          currentStep: 5,
          isSubmitting: false,
        });

        return outcome.result;
      } catch (error) {
        set({ isSubmitting: false });
        throw error;
      }
    },
  }),
);
