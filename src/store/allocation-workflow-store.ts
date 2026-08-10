import { create } from "zustand";

import { getMaterialWorkflowDetail } from "@/mock/allocation-workflow";
import { adminRequisitionsService } from "@/services/adminRequisitions";
import { warehouseService } from "@/services/warehouse";
import {
  buildCentralWarehouseOptions,
  getCentralStockBatches,
} from "@/utils/allocation-stock";
import { mergeRequisitionIntoWorkflowList } from "@/utils/allocation-workflow-bridge";
import { setActiveAllocationForTransfer } from "@/utils/allocation-transfer-bridge";
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
  loadApprovedRequisitions: () => Promise<void>;
  loadWarehouseInventory: () => Promise<void>;
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
    requisitions: [],
    inventory: [],
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
        requisitions: [],
        inventory: [],
      });
      void get().loadApprovedRequisitions();
      void get().loadWarehouseInventory();
    },

    loadWarehouseInventory: async () => {
      try {
        const result = await warehouseService.listInventory({
          page: 1,
          limit: 10000,
        });
        set({ inventory: result.data });
        if (get().selectedRequisition) {
          get().hydrateWarehouses();
        }
      } catch {
        // Keep empty inventory if API unavailable.
      }
    },

    loadApprovedRequisitions: async () => {
      try {
        const list = await adminRequisitionsService.list({
          status: "APPROVED",
          page: 1,
          limit: 100,
        });
        const approved = list.data.filter(
          (item) =>
            item.status === "APPROVED" && item.allocationStatus !== "ALLOCATED",
        );
        if (approved.length === 0) {
          set({ requisitions: [] });
          return;
        }

        const selectedId = get().selectedRequisition?.id;
        set({
          requisitions: selectedId
            ? mergeRequisitionIntoWorkflowList(
                get().selectedRequisition!,
                approved,
              )
            : approved,
        });
      } catch {
        // Keep current queue if API is unavailable.
      }
    },

    reset: () => {
      set({
        currentStep: 1,
        maxCompletedStep: 0,
        isTransitioning: false,
        isSubmitting: false,
        requisitions: [],
        inventory: [],
        selectedRequisition: null,
        selectedWarehouse: null,
        warehouses: [],
        form: DEFAULT_FORM,
        result: null,
        draftSaved: false,
      });
      void get().loadApprovedRequisitions();
      void get().loadWarehouseInventory();
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

      set({
        currentStep: autoAdvance ? 2 : 1,
        maxCompletedStep: autoAdvance ? 1 : 0,
        isTransitioning: false,
        isSubmitting: false,
        requisitions: mergeRequisitionIntoWorkflowList(requisition, []),
        selectedRequisition: requisition,
        selectedWarehouse: null,
        warehouses: [],
        form: DEFAULT_FORM,
        result: null,
        draftSaved: false,
      });

      void Promise.all([
        get().loadApprovedRequisitions(),
        get().loadWarehouseInventory(),
      ]).then(() => {
        if (autoAdvance) get().hydrateWarehouses();
      });
    },

    hydrateWarehouses: () => {
      const { selectedRequisition, inventory } = get();
      if (!selectedRequisition) return;

      const warehouses = buildCentralWarehouseOptions(
        selectedRequisition,
        inventory,
      );

      const defaultWarehouse =
        warehouses.find(
          (warehouse) =>
            warehouse.status !== "EMPTY" &&
            warehouse.stock >= selectedRequisition.requestedQty,
        ) ?? warehouses.find((warehouse) => warehouse.status !== "EMPTY");

      const batches = getCentralStockBatches(
        defaultWarehouse?.id ?? "",
        defaultWarehouse?.stock ?? 0,
      );
      const defaultBatch = batches[0];
      const defaultQty = Math.min(
        selectedRequisition.requestedQty,
        defaultWarehouse?.stock ?? 0,
        defaultBatch?.available ?? defaultWarehouse?.stock ?? 0,
      );

      set({
        warehouses,
        selectedWarehouse: defaultWarehouse ?? null,
        form: {
          ...DEFAULT_FORM,
          warehouseSourceId: defaultWarehouse?.id ?? "",
          batchId: defaultBatch?.id ?? "",
          allocationQty: defaultQty > 0 ? defaultQty : 0,
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
      const { selectedRequisition, selectedWarehouse, form } = get();
      if (!selectedRequisition || !selectedWarehouse) return;

      const batches = getCentralStockBatches(
        selectedWarehouse.id,
        selectedWarehouse.stock,
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
        const detail = await adminRequisitionsService.getById(
          selectedRequisition.id,
        );
        const materials = detail.materials ?? [];
        if (materials.length === 0) {
          throw new Error("No materials found on this requisition.");
        }

        const allocateItems =
          materials.length === 1
            ? [
                {
                  itemId: materials[0].id,
                  allocatedQty: Math.max(
                    1,
                    Math.floor(form.allocationQty || materials[0].requestedQty),
                  ),
                },
              ]
            : materials.map((material) => ({
                itemId: material.id,
                allocatedQty: Math.max(
                  1,
                  Math.floor(
                    material.approvedQty ??
                      material.requestedQty ??
                      form.allocationQty,
                  ),
                ),
              }));

        await adminRequisitionsService.allocate(selectedRequisition.id, {
          items: allocateItems,
          warehouseBin: warehouse.name || form.warehouseSourceId,
          comment: form.remarks || undefined,
        });

        const materialDetail = getMaterialWorkflowDetail(
          selectedRequisition.materialId,
          selectedRequisition,
        );
        const batches = getCentralStockBatches(warehouse.id, warehouse.stock);
        const batch = batches.find((entry) => entry.id === form.batchId);
        const allocatedQty = allocateItems.reduce(
          (sum, item) => sum + item.allocatedQty,
          0,
        );

        const humanRequestId = selectedRequisition.requestId.replace(/^#/, "");
        const workflowResult: AllocationWorkflowResult = {
          allocationId: `ALC-${humanRequestId.replace(/^REQ-/, "")}`,
          requestId: humanRequestId,
          requisitionUuid: selectedRequisition.id,
          destinationHub: selectedRequisition.hubName,
          destinationHubId: selectedRequisition.hubId,
          quantity: allocatedQty,
          unit: selectedRequisition.unit,
          material: selectedRequisition.material,
          warehouseName: warehouse.name,
          warehouseHubId: warehouse.id,
          batchLabel: batch?.label ?? form.batchId ?? "Central Stock",
          warehouseRemaining: Math.max(0, warehouse.stock - allocatedQty),
          baseWeight: materialDetail.unitDensity
            ? materialDetail.unitDensity * allocatedQty
            : undefined,
          status: "COMPLETED",
          inventoryReserved: true,
        };

        setActiveAllocationForTransfer(workflowResult);
        await get().loadWarehouseInventory();

        set({
          requisitions: applyRequisitionUpdates(state.requisitions, [
            {
              ...selectedRequisition,
              allocationStatus: "ALLOCATED",
              status: "ALLOCATED",
            },
          ]),
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
