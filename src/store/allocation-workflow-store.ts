import { create } from "zustand";

import {
  getMaterialBatches,
  getMaterialWorkflowDetail,
  getWorkflowRequisitionSeed,
  getWorkflowWarehouses,
} from "@/mock/allocation-workflow";
import { mergeRequisitionIntoWorkflowList } from "@/utils/allocation-workflow-bridge";
import { setActiveAllocationForTransfer } from "@/utils/allocation-transfer-bridge";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { InventoryItem } from "@/types/inventory.types";
import type {
  AllocationWorkflowFormValues,
  AllocationWorkflowResult,
  AllocationWorkflowStep,
  RequisitionListItem,
  WorkflowWarehouse,
} from "@/types/warehouse.types";

const STEP_TRANSITION_MS = 500;

const DEFAULT_FORM: AllocationWorkflowFormValues = {
  warehouseSourceId: "",
  batchId: "",
  allocationQty: 0,
  remarks: "",
};

interface AllocationWorkflowState {
  currentStep: AllocationWorkflowStep;
  maxCompletedStep: number;
  isTransitioning: boolean;
  isSubmitting: boolean;
  requisitions: RequisitionListItem[];
  inventory: InventoryItem[];
  selectedRequisition: RequisitionListItem | null;
  selectedWarehouse: WorkflowWarehouse | null;
  warehouses: WorkflowWarehouse[];
  form: AllocationWorkflowFormValues;
  result: AllocationWorkflowResult | null;
  draftSaved: boolean;

  initialize: () => void;
  reset: () => void;
  canAccessStep: (step: AllocationWorkflowStep) => boolean;
  selectRequisition: (requisition: RequisitionListItem) => void;
  selectWarehouse: (warehouseId: string) => void;
  updateForm: (values: Partial<AllocationWorkflowFormValues>) => void;
  saveDraft: () => void;
  goToStep: (step: AllocationWorkflowStep) => Promise<void>;
  goNext: () => Promise<void>;
  goBack: () => Promise<void>;
  confirmAllocation: () => Promise<AllocationWorkflowResult>;
  hydrateWarehouses: () => void;
  hydrateFormDefaults: () => void;
  startWithRequisition: (
    requisition: RequisitionListItem,
    options?: { autoAdvance?: boolean },
  ) => void;
}

function applyRequisitionUpdates(
  items: RequisitionListItem[],
  updates: RequisitionListItem[],
): RequisitionListItem[] {
  const updateMap = new Map(updates.map((item) => [item.id, item]));
  return items.map((item) => updateMap.get(item.id) ?? item);
}

export const useAllocationWorkflowStore = create<AllocationWorkflowState>(
  (set, get) => ({
    currentStep: 1,
    maxCompletedStep: 0,
    isTransitioning: false,
    isSubmitting: false,
    requisitions: getWorkflowRequisitionSeed(),
    inventory: useWarehouseErpStore.getState().inventory,
    selectedRequisition: null,
    selectedWarehouse: null,
    warehouses: [],
    form: DEFAULT_FORM,
    result: null,
    draftSaved: false,

    initialize: () => {
      const state = get();
      if (state.selectedRequisition || state.result) return;
      set({
        requisitions: getWorkflowRequisitionSeed(),
        inventory: useWarehouseErpStore.getState().inventory,
      });
    },

    reset: () => {
      set({
        currentStep: 1,
        maxCompletedStep: 0,
        isTransitioning: false,
        isSubmitting: false,
        requisitions: getWorkflowRequisitionSeed(),
        inventory: useWarehouseErpStore.getState().inventory,
        selectedRequisition: null,
        selectedWarehouse: null,
        warehouses: [],
        form: DEFAULT_FORM,
        result: null,
        draftSaved: false,
      });
    },

    canAccessStep: (step) => {
      const { maxCompletedStep, result } = get();
      if (step === 5) return result !== null;
      return step <= Math.max(maxCompletedStep, 1);
    },

    selectRequisition: (requisition) => {
      set({ selectedRequisition: requisition });
    },

    startWithRequisition: (requisition, options) => {
      const autoAdvance = options?.autoAdvance ?? false;
      const requisitions = mergeRequisitionIntoWorkflowList(requisition);

      set({
        currentStep: autoAdvance ? 2 : 1,
        maxCompletedStep: autoAdvance ? 1 : 0,
        isTransitioning: false,
        isSubmitting: false,
        requisitions,
        inventory: useWarehouseErpStore.getState().inventory,
        selectedRequisition: requisition,
        selectedWarehouse: null,
        warehouses: [],
        form: DEFAULT_FORM,
        result: null,
        draftSaved: false,
      });

      if (autoAdvance) {
        get().hydrateWarehouses();
      }
    },

    hydrateWarehouses: () => {
      const { selectedRequisition, inventory } = get();
      if (!selectedRequisition) return;

      const warehouses = getWorkflowWarehouses(
        selectedRequisition.materialId,
        selectedRequisition.requestedQty,
        inventory,
      );

      const defaultWarehouse =
        warehouses.find(
          (warehouse) =>
            warehouse.status !== "EMPTY" &&
            warehouse.stock >= selectedRequisition.requestedQty,
        ) ?? warehouses.find((warehouse) => warehouse.status !== "EMPTY");

      set({
        warehouses,
        selectedWarehouse: defaultWarehouse ?? null,
        form: {
          ...DEFAULT_FORM,
          warehouseSourceId: defaultWarehouse?.id ?? "",
        },
      });
    },

    selectWarehouse: (warehouseId) => {
      const { warehouses } = get();
      const warehouse = warehouses.find((entry) => entry.id === warehouseId);
      if (!warehouse || warehouse.status === "EMPTY") return;
      set({ selectedWarehouse: warehouse });
      get().hydrateFormDefaults();
    },

    hydrateFormDefaults: () => {
      const { selectedRequisition, selectedWarehouse, inventory, form } = get();
      if (!selectedRequisition || !selectedWarehouse) return;

      const batches = getMaterialBatches(
        selectedRequisition.materialId,
        selectedWarehouse.id,
        inventory,
      );
      const defaultBatch = batches[0];
      const defaultQty = Math.min(
        selectedRequisition.requestedQty,
        selectedWarehouse.stock,
        defaultBatch?.available ?? selectedWarehouse.stock,
      );

      set({
        form: {
          warehouseSourceId: selectedWarehouse.id,
          batchId: defaultBatch?.id ?? "",
          allocationQty: defaultQty > 0 ? defaultQty : 0,
          remarks: form.remarks,
        },
      });
    },

    updateForm: (values) => {
      set((state) => ({
        form: { ...state.form, ...values },
      }));
    },

    saveDraft: () => {
      set({ draftSaved: true });
    },

    goToStep: async (step) => {
      const state = get();
      if (!state.canAccessStep(step)) return;

      set({ isTransitioning: true });
      await new Promise((resolve) => setTimeout(resolve, STEP_TRANSITION_MS));
      set({ currentStep: step, isTransitioning: false });
    },

    goNext: async () => {
      const state = get();
      const nextStep = Math.min(
        5,
        state.currentStep + 1,
      ) as AllocationWorkflowStep;

      if (state.currentStep === 1 && state.selectedRequisition) {
        state.hydrateWarehouses();
      }

      if (state.currentStep === 2 && state.selectedWarehouse) {
        state.hydrateFormDefaults();
      }

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
        currentStep: (state.currentStep - 1) as AllocationWorkflowStep,
        isTransitioning: false,
      });
    },

    confirmAllocation: async () => {
      const state = get();
      const { selectedRequisition, form, warehouses } = state;

      if (!selectedRequisition) {
        throw new Error("No requisition selected.");
      }

      const warehouse = warehouses.find(
        (entry) => entry.id === form.warehouseSourceId,
      );
      if (!warehouse) {
        throw new Error("Selected warehouse not found.");
      }

      set({ isSubmitting: true });

      try {
        await new Promise((resolve) => setTimeout(resolve, 700));

        const materialDetail = getMaterialWorkflowDetail(
          selectedRequisition.materialId,
          selectedRequisition,
        );
        const batches = getMaterialBatches(
          selectedRequisition.materialId,
          form.warehouseSourceId,
          state.inventory,
        );
        const batch = batches.find((entry) => entry.id === form.batchId);

        const { workflowResult } = useWarehouseErpStore
          .getState()
          .completeAllocation({
            requisitionId: selectedRequisition.id,
            warehouseId: form.warehouseSourceId,
            warehouseName: warehouse.name,
            allocationQty: form.allocationQty,
            batchLabel: batch?.label ?? form.batchId,
            remarks: form.remarks,
            baseWeight: materialDetail.unitDensity
              ? materialDetail.unitDensity * form.allocationQty
              : undefined,
          });

        setActiveAllocationForTransfer(workflowResult);

        set({
          requisitions: applyRequisitionUpdates(state.requisitions, [
            {
              ...selectedRequisition,
              allocationStatus: "ALLOCATED",
              status: "ALLOCATED",
            },
          ]),
          inventory: useWarehouseErpStore.getState().inventory,
          result: workflowResult,
          maxCompletedStep: 5,
          currentStep: 5,
          isSubmitting: false,
        });

        return workflowResult;
      } catch (error) {
        set({ isSubmitting: false });
        throw error;
      }
    },
  }),
);

export function getWorkflowMaterialDetail(
  requisition: RequisitionListItem | null,
) {
  if (!requisition) return null;
  return getMaterialWorkflowDetail(requisition.materialId, requisition);
}
