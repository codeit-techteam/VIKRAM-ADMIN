import { create } from "zustand";

import { MOCK_DATABASE_SEED } from "@/mock/mock-database";
import { resolveHubMaterialDefaults } from "@/mock/sub-hubs";
import { computeRequisitionStats } from "@/mock/requisitions";
import { computeTransferStats } from "@/mock/transfers";
import { getAvailableStock } from "@/mock/inventory";
import {
  allocationToWorkflowResult,
  erpAllocationToMaterialItem,
  buildOutboundTransferActivities,
  erpLogToInventoryActivity,
  generateAllocationId,
  generateId,
  resolveMaterialName,
  resolveSku,
  upsertHubInventory,
} from "@/store/warehouse-erp-helpers";
import { repairErpStoreState } from "@/store/erp-state-repair";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import type {
  CompleteAllocationParams,
  CompleteAllocationResult,
  ErpActivityLog,
  ErpAllocation,
  ErpDispatch,
  HubInventoryEntry,
  SubHub,
  SubHubStat,
  SubHubSummary,
  SubHubTableRow,
} from "@/types/erp.types";
import type { CreateHubResult, HubDraft } from "@/types/hub-onboarding.types";
import { buildHubFromDraft } from "@/utils/hub-onboarding";
import type { InventoryItem } from "@/types/inventory.types";
import type {
  AllocationWorkflowResult,
  FleetDriver,
  FleetVehicle,
  InventoryActivity,
  LoadingChecklist,
  MaterialAllocationItem,
  RequisitionApprovalPayload,
  RequisitionListItem,
  RequisitionRejectionPayload,
  TransferActivityLog,
  TransferDocument,
  TransferListItem,
  TransferStatus,
  TransferTimelineEvent,
  WarehouseStat,
} from "@/types/warehouse.types";
import {
  computeSubHubDashboardKpis,
  computeSubHubSummaries,
  computeSubHubTableRows,
} from "@/utils/sub-hub-metrics";
import {
  canCompleteLoading,
  canDispatchNow,
  canStartLoading,
  createTimelineEvent,
  DEFAULT_LOADING_CHECKLIST,
  DISPATCH_QUEUE_STATUSES,
  hasDriverAssigned,
  hasVehicleAssigned,
  isHubReceivingEligible,
  isLoadingChecklistComplete,
  normalizeTransferStatus,
} from "@/utils/transfer-actions";

function generateGatePassId(): string {
  return `GP-${Date.now().toString().slice(-8)}`;
}

function generateDocumentId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function getQuantityLabel(transfer: TransferListItem): string {
  return `${transfer.quantity ?? 0} ${transfer.quantityUnit ?? "units"}`;
}

function logActivityEntry(
  logs: ErpActivityLog[],
  entry: Omit<ErpActivityLog, "id" | "timestamp">,
): ErpActivityLog[] {
  const record: ErpActivityLog = {
    ...entry,
    id: generateId("act"),
    timestamp: new Date().toISOString(),
  };
  return [record, ...logs];
}

export interface WarehouseErpState {
  requisitions: RequisitionListItem[];
  allocations: ErpAllocation[];
  transfers: TransferListItem[];
  dispatches: ErpDispatch[];
  inventory: InventoryItem[];
  vehicles: FleetVehicle[];
  drivers: FleetDriver[];
  hubInventory: HubInventoryEntry[];
  subHubs: SubHub[];
  activityLogs: ErpActivityLog[];

  approveRequisition: (
    requisitionId: string,
    payload: RequisitionApprovalPayload,
  ) => void;
  rejectRequisition: (
    requisitionId: string,
    payload: RequisitionRejectionPayload,
  ) => void;
  completeAllocation: (
    params: CompleteAllocationParams,
  ) => CompleteAllocationResult;
  getMaterialAllocations: () => MaterialAllocationItem[];
  getTransferReadyAllocations: () => AllocationWorkflowResult[];
  getAllocationById: (
    allocationId: string,
  ) => AllocationWorkflowResult | undefined;
  getAllocationRecordById: (allocationId: string) => ErpAllocation | undefined;
  syncAllocationResult: (result: AllocationWorkflowResult) => void;

  addTransfer: (transfer: TransferListItem) => void;
  updateTransfer: (
    transferId: string,
    updates: Partial<TransferListItem>,
  ) => void;
  getTransferById: (transferId: string) => TransferListItem | undefined;
  getTransferByAllocationId: (
    allocationId: string,
  ) => TransferListItem | undefined;
  deleteTransfer: (transferId: string) => void;
  appendTimeline: (transferId: string, event: TransferTimelineEvent) => void;
  appendActivityLog: (
    transferId: string,
    log: Omit<TransferActivityLog, "id" | "timestamp">,
  ) => void;
  assignVehicle: (transferId: string, vehicle: FleetVehicle) => void;
  assignDriver: (transferId: string, driver: FleetDriver) => void;
  markReadyForDispatch: (transferId: string) => void;
  startLoading: (transferId: string) => void;
  updateLoadingChecklist: (
    transferId: string,
    checklist: Partial<LoadingChecklist>,
  ) => void;
  completeLoading: (transferId: string) => void;
  confirmDispatch: (transferId: string) => void;
  startDispatch: (transferId: string) => void;
  updateEta: (transferId: string, newEta: string, remarks?: string) => void;
  addRemarks: (transferId: string, remarks: string) => void;
  reportDelay: (transferId: string, newEta: string, reason: string) => void;
  markReachedHub: (transferId: string) => void;
  markDelivered: (transferId: string) => void;
  receiveAtHub: (
    transferId: string,
    verification?: { condition?: string; remarks?: string },
  ) => void;
  getDispatchQueueTransfers: () => TransferListItem[];
  getHubReceivingTransfers: () => TransferListItem[];
  getPendingDispatchTransfers: () => TransferListItem[];

  getInventoryActivities: () => InventoryActivity[];
  getCriticalRequisitions: () => RequisitionListItem[];
  getDashboardStats: () => WarehouseStat[];
  getSubHubDashboardKpis: () => SubHubStat[];
  getSubHubSummaries: () => SubHubSummary[];
  getSubHubTableRows: () => SubHubTableRow[];
  addSubHub: (draft: HubDraft) => CreateHubResult;
  adjustHubInventory: (params: {
    hubId: string;
    materialId: string;
    newQuantity: number;
    reason?: string;
    adminName?: string;
  }) => void;
  resetDatabase: () => void;
}

export const useWarehouseErpStore = create<WarehouseErpState>((set, get) => ({
  ...MOCK_DATABASE_SEED,

  approveRequisition: (requisitionId, payload) => {
    const state = get();
    const requisition = state.requisitions.find(
      (item) => item.id === requisitionId,
    );
    if (!requisition || requisition.status !== "PENDING") return;

    const now = new Date().toISOString();
    const allocationId = generateAllocationId();

    const allocation: ErpAllocation = {
      id: `alloc-${requisitionId}`,
      allocationId,
      requestId: requisition.requestId.replace(/^#/, ""),
      requisitionId,
      warehouseId: requisition.warehouseId,
      sourceWarehouse: requisition.warehouseName,
      materialId: requisition.materialId,
      material: requisition.material,
      materialSpec: requisition.materialSpec,
      sku: resolveSku(requisition.materialId),
      destinationHub: requisition.hubName,
      hubId: requisition.hubId,
      requestedQty: requisition.requestedQty,
      reservedQty: 0,
      unit: requisition.unit,
      priority: requisition.priority,
      status: "PENDING",
      createdAt: now,
    };

    set({
      requisitions: state.requisitions.map((item) =>
        item.id === requisitionId
          ? {
              ...item,
              status: "APPROVED",
              allocationStatus: "PENDING",
              approvedQty: item.requestedQty,
              approvedAt: now,
              allocationId,
              adminRemarks: payload.remarks?.trim() || item.adminRemarks,
            }
          : item,
      ),
      allocations: [
        allocation,
        ...state.allocations.filter(
          (item) => item.requisitionId !== requisitionId,
        ),
      ],
      activityLogs: logActivityEntry(state.activityLogs, {
        user: payload.adminName,
        module: "Requisition",
        action: "Requisition Approved",
        remarks: `${requisition.requestId} — ${resolveMaterialName(requisition.material, requisition.materialSpec)}`,
        entityId: requisitionId,
        entityType: "requisition",
      }),
    });
  },

  rejectRequisition: (requisitionId, payload) => {
    const state = get();
    set({
      requisitions: state.requisitions.map((item) =>
        item.id === requisitionId
          ? {
              ...item,
              status: "REJECTED",
              allocationStatus: "NOT_APPLICABLE",
              adminRemarks: payload.remarks,
              rejectionReason: payload.remarks,
            }
          : item,
      ),
      allocations: state.allocations.filter(
        (item) => item.requisitionId !== requisitionId,
      ),
      activityLogs: logActivityEntry(state.activityLogs, {
        user: payload.adminName,
        module: "Requisition",
        action: "Requisition Rejected",
        remarks: payload.remarks,
        entityId: requisitionId,
        entityType: "requisition",
      }),
    });
  },

  completeAllocation: (params) => {
    const state = get();
    const requisition = state.requisitions.find(
      (item) => item.id === params.requisitionId,
    );
    if (!requisition) {
      throw new Error("Requisition not found.");
    }

    const item = state.inventory.find(
      (entry) => entry.id === requisition.materialId,
    );
    if (!item) {
      throw new Error("Material not found in inventory.");
    }

    const available = getAvailableStock(item);
    if (params.allocationQty > available) {
      throw new Error("Allocation quantity exceeds available stock.");
    }

    const now = new Date().toISOString();
    const allocation =
      state.allocations.find(
        (entry) => entry.requisitionId === params.requisitionId,
      ) ?? null;

    const allocationId = allocation?.allocationId ?? generateAllocationId();

    const completedAllocation: ErpAllocation = {
      id: allocation?.id ?? `alloc-${params.requisitionId}`,
      allocationId,
      requestId: requisition.requestId.replace(/^#/, ""),
      requisitionId: params.requisitionId,
      warehouseId: params.warehouseId,
      sourceWarehouse: params.warehouseName,
      materialId: requisition.materialId,
      material: requisition.material,
      materialSpec: requisition.materialSpec,
      sku: resolveSku(requisition.materialId),
      destinationHub: requisition.hubName,
      hubId: requisition.hubId,
      requestedQty: requisition.requestedQty,
      reservedQty: params.allocationQty,
      unit: requisition.unit,
      priority: requisition.priority,
      status: "COMPLETED",
      createdAt: allocation?.createdAt ?? now,
      completedAt: now,
      remarks: params.remarks,
      batchLabel: params.batchLabel,
      baseWeight: params.baseWeight,
    };

    const updatedInventory = state.inventory.map((entry) =>
      entry.id === requisition.materialId
        ? {
            ...entry,
            committedStock: entry.committedStock + params.allocationQty,
          }
        : entry,
    );

    const workflowResult = allocationToWorkflowResult(
      completedAllocation,
      updatedInventory,
    );

    set({
      inventory: updatedInventory,
      allocations: [
        completedAllocation,
        ...state.allocations.filter(
          (entry) => entry.requisitionId !== params.requisitionId,
        ),
      ],
      requisitions: state.requisitions.map((entry) =>
        entry.id === params.requisitionId
          ? {
              ...entry,
              status: "ALLOCATED",
              allocationStatus: "ALLOCATED",
              allocationId,
            }
          : entry,
      ),
      activityLogs: logActivityEntry(
        logActivityEntry(state.activityLogs, {
          user: params.adminName ?? "Warehouse Manager",
          module: "Allocation",
          action: "Inventory Reserved",
          remarks: `${params.allocationQty} ${requisition.unit} — ${resolveMaterialName(requisition.material, requisition.materialSpec)}`,
          entityId: allocationId,
          entityType: "allocation",
        }),
        {
          user: params.adminName ?? "Warehouse Manager",
          module: "Allocation",
          action: "Allocation Completed",
          remarks: `Linked to ${requisition.requestId}`,
          entityId: allocationId,
          entityType: "allocation",
        },
      ),
    });

    return { allocation: completedAllocation, workflowResult };
  },

  getMaterialAllocations: () => {
    const state = get();
    // Keep Allocation Center aligned with approved requisitions that still
    // need allocation (covers approve → allocate without a full seed rebuild).
    const pendingIds = new Set(
      state.allocations
        .filter((entry) => entry.status === "PENDING")
        .map((entry) => entry.requisitionId),
    );

    const missingPending = state.requisitions
      .filter(
        (item) =>
          item.status === "APPROVED" &&
          item.allocationStatus === "PENDING" &&
          !pendingIds.has(item.id),
      )
      .map((item) => ({
        id: `alloc-${item.id}`,
        allocationId:
          item.allocationId ?? `ALC-${item.id.replace(/^req-/, "")}`,
        requestId: item.requestId.replace(/^#/, ""),
        requisitionId: item.id,
        warehouseId: item.warehouseId,
        sourceWarehouse: item.warehouseName,
        materialId: item.materialId,
        material: item.material,
        materialSpec: item.materialSpec,
        sku: resolveSku(item.materialId),
        destinationHub: item.hubName,
        hubId: item.hubId,
        requestedQty: item.requestedQty,
        reservedQty: 0,
        unit: item.unit,
        priority: item.priority,
        status: "PENDING" as const,
        createdAt: item.approvedAt ?? item.createdAt,
      }));

    return [...missingPending, ...state.allocations].map(
      erpAllocationToMaterialItem,
    );
  },

  getTransferReadyAllocations: () => {
    const state = get();
    const linked = new Set(
      state.transfers.map((transfer) => transfer.allocationId).filter(Boolean),
    );

    return state.allocations
      .filter(
        (allocation) =>
          allocation.status === "COMPLETED" &&
          !linked.has(allocation.allocationId),
      )
      .map((allocation) =>
        allocationToWorkflowResult(allocation, state.inventory),
      );
  },

  getAllocationById: (allocationId) => {
    const state = get();
    const allocation = state.allocations.find(
      (entry) =>
        entry.allocationId === allocationId || entry.id === allocationId,
    );
    if (!allocation) return undefined;
    return allocationToWorkflowResult(allocation, state.inventory);
  },

  getAllocationRecordById: (allocationId) =>
    get().allocations.find(
      (entry) =>
        entry.allocationId === allocationId || entry.id === allocationId,
    ),

  syncAllocationResult: (result) => {
    const state = get();
    const requisition = state.requisitions.find(
      (item) =>
        item.requestId.replace(/^#/, "") === result.requestId.replace(/^#/, ""),
    );
    if (!requisition) return;

    const existing = state.allocations.find(
      (entry) => entry.allocationId === result.allocationId,
    );
    if (existing?.status === "COMPLETED") return;

    const now = new Date().toISOString();
    const allocation: ErpAllocation = {
      id: existing?.id ?? `alloc-${requisition.id}`,
      allocationId: result.allocationId,
      requestId: result.requestId.replace(/^#/, ""),
      requisitionId: requisition.id,
      warehouseId: requisition.warehouseId,
      sourceWarehouse: result.warehouseName,
      materialId: requisition.materialId,
      material: requisition.material,
      materialSpec: requisition.materialSpec,
      sku: resolveSku(requisition.materialId),
      destinationHub: result.destinationHub,
      hubId: requisition.hubId,
      requestedQty: requisition.requestedQty,
      reservedQty: result.quantity,
      unit: result.unit,
      priority: requisition.priority,
      status: "COMPLETED",
      createdAt: existing?.createdAt ?? now,
      completedAt: now,
      batchLabel: result.batchLabel,
      baseWeight: result.baseWeight,
    };

    set({
      allocations: [
        allocation,
        ...state.allocations.filter(
          (entry) => entry.allocationId !== result.allocationId,
        ),
      ],
      requisitions: state.requisitions.map((item) =>
        item.id === requisition.id
          ? {
              ...item,
              status: "ALLOCATED",
              allocationStatus: "ALLOCATED",
              allocationId: result.allocationId,
            }
          : item,
      ),
    });
  },

  addTransfer: (transfer) => {
    const state = get();
    set({
      transfers: [transfer, ...state.transfers],
      requisitions: state.requisitions.map((item) =>
        item.allocationId === transfer.allocationId ||
        item.requestId.replace(/^#/, "") === transfer.requisitionId
          ? {
              ...item,
              status: "TRANSFERRED",
              transferId: transfer.transferId,
            }
          : item,
      ),
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Transfer Manager",
        module: "Transfer",
        action: "Transfer Created",
        remarks: `${transfer.transferId} → ${transfer.destinationHub}`,
        entityId: transfer.transferId,
        entityType: "transfer",
      }),
    });
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

  getTransferById: (transferId) =>
    get().transfers.find((transfer) => transfer.transferId === transferId),

  getTransferByAllocationId: (allocationId) =>
    get().transfers.find((transfer) => transfer.allocationId === allocationId),

  deleteTransfer: (transferId) => {
    set((state) => ({
      transfers: state.transfers.filter(
        (transfer) => transfer.transferId !== transferId,
      ),
    }));
  },

  appendTimeline: (transferId, event) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    get().updateTransfer(transferId, {
      timeline: [...transfer.timeline, event],
    });
  },

  appendActivityLog: (transferId, log) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    const entry: TransferActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    get().updateTransfer(transferId, {
      activityLogs: [entry, ...transfer.activityLogs],
    });
  },

  assignVehicle: (transferId, vehicle) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    const status = normalizeTransferStatus(transfer.status);
    if (status !== "DRAFT" && status !== "TRANSFER_CREATED") {
      throw new Error("Vehicle can only be assigned before dispatch.");
    }
    if (hasVehicleAssigned(transfer)) {
      throw new Error("Vehicle is already assigned.");
    }

    const event = createTimelineEvent(
      "VEHICLE_ASSIGNED",
      `Vehicle ${vehicle.vehicleNumber} assigned`,
      { actor: "Dispatch Manager" },
    );

    get().updateTransfer(transferId, {
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      status: "TRANSFER_CREATED",
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Vehicle Assigned",
      actor: "Dispatch Manager",
      details: vehicle.vehicleNumber,
    });

    const state = get();
    set({
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Dispatch Manager",
        module: "Transfer",
        action: "Vehicle Assigned",
        remarks: vehicle.vehicleNumber,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  assignDriver: (transferId, driver) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    const status = normalizeTransferStatus(transfer.status);
    if (status !== "DRAFT" && status !== "TRANSFER_CREATED") {
      throw new Error("Driver can only be assigned before dispatch.");
    }
    if (hasDriverAssigned(transfer)) {
      throw new Error("Driver is already assigned.");
    }

    const event = createTimelineEvent(
      "DRIVER_ASSIGNED",
      `${driver.name} (${driver.employeeId}) assigned`,
      { actor: "Dispatch Manager" },
    );

    get().updateTransfer(transferId, {
      driverId: driver.id,
      assignedDriver: {
        name: driver.name,
        employeeId: driver.employeeId,
      },
      status: "TRANSFER_CREATED",
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Driver Assigned",
      actor: "Dispatch Manager",
      details: driver.name,
    });

    const state = get();
    set({
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Dispatch Manager",
        module: "Transfer",
        action: "Driver Assigned",
        remarks: driver.name,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  markReadyForDispatch: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!hasVehicleAssigned(transfer) || !hasDriverAssigned(transfer)) {
      throw new Error("Vehicle and driver must be assigned first.");
    }

    const readyEvent = createTimelineEvent(
      "READY_FOR_DISPATCH",
      "Transfer queued for dispatch",
      { actor: "Dispatch Manager" },
    );
    get().updateTransfer(transferId, {
      status: "TRANSFER_CREATED",
      timeline: [...transfer.timeline, readyEvent],
    });
    get().appendActivityLog(transferId, {
      action: "Ready For Dispatch",
      actor: "Dispatch Manager",
      details: "Transfer queued in pending dispatch",
    });
  },

  startLoading: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!canStartLoading(transfer)) {
      throw new Error(
        "Loading can only start for pending dispatch transfers with fleet assigned.",
      );
    }

    const loadingStartedAt = new Date().toISOString();
    const event = createTimelineEvent(
      "LOADING_STARTED",
      "Material loading initiated at warehouse bay",
      { actor: "Warehouse Operator" },
    );

    get().updateTransfer(transferId, {
      status: "LOADING",
      loadingStartedAt,
      loadingChecklist: { ...DEFAULT_LOADING_CHECKLIST },
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Loading Started",
      actor: "Warehouse Operator",
      details: "Verification checklist opened",
    });

    const state = get();
    set({
      dispatches: state.dispatches.map((dispatch) =>
        dispatch.transferId === transferId
          ? { ...dispatch, status: "LOADING" }
          : dispatch,
      ),
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Warehouse Operator",
        module: "Dispatch",
        action: "Loading Started",
        remarks: transfer.transferId,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  updateLoadingChecklist: (transferId, checklist) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "LOADING") {
      throw new Error("Checklist can only be updated during loading.");
    }

    get().updateTransfer(transferId, {
      loadingChecklist: {
        ...DEFAULT_LOADING_CHECKLIST,
        ...transfer.loadingChecklist,
        ...checklist,
      },
    });
  },

  completeLoading: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!canCompleteLoading(transfer)) {
      throw new Error("Transfer is not in loading status.");
    }

    const checklist = {
      ...DEFAULT_LOADING_CHECKLIST,
      ...transfer.loadingChecklist,
    };
    if (!isLoadingChecklistComplete(checklist)) {
      throw new Error("Complete all verification checklist items first.");
    }

    const loadingCompletedAt = new Date().toISOString();
    const event = createTimelineEvent(
      "LOADING_COMPLETED",
      "All loading verifications passed",
      { actor: "Warehouse Operator" },
    );

    get().updateTransfer(transferId, {
      status: "READY_FOR_DISPATCH",
      loadingCompletedAt,
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Loading Completed",
      actor: "Warehouse Operator",
      details: "Transfer ready for dispatch confirmation",
    });

    const state = get();
    set({
      dispatches: state.dispatches.map((dispatch) =>
        dispatch.transferId === transferId
          ? { ...dispatch, status: "READY_FOR_DISPATCH" }
          : dispatch,
      ),
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Warehouse Operator",
        module: "Dispatch",
        action: "Loading Completed",
        remarks: transfer.transferId,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  confirmDispatch: (transferId) => {
    const state = get();
    const transfer = state.getTransferById(transferId);
    if (!transfer) return;
    if (!canDispatchNow(transfer)) {
      throw new Error(
        "Dispatch requires ready-for-dispatch status with vehicle and driver assigned.",
      );
    }

    const allocation = state.allocations.find(
      (entry) => entry.allocationId === transfer.allocationId,
    );
    const qty = transfer.quantity ?? allocation?.reservedQty ?? 0;
    const materialId =
      allocation?.materialId ??
      state.requisitions.find(
        (item) => item.requestId.replace(/^#/, "") === transfer.requisitionId,
      )?.materialId;

    const dispatchAt = new Date().toISOString();
    const gatePassId = generateGatePassId();
    const dispatchStartedEvent = createTimelineEvent(
      "DISPATCH_STARTED",
      `Gate pass ${gatePassId} issued`,
      { actor: "Gate Operator" },
    );
    const inTransitEvent = createTimelineEvent(
      "IN_TRANSIT",
      `En route to ${transfer.destinationHub}`,
      { actor: "Gate Operator" },
    );

    const gatePassDoc: TransferDocument = {
      id: generateDocumentId("gp"),
      name: `Gate Pass — ${gatePassId}`,
      type: "gate-pass",
      url: "#",
      createdAt: dispatchAt,
    };

    const dispatchLogDoc: TransferDocument = {
      id: generateDocumentId("dl"),
      name: `Dispatch Log — ${transfer.transferId}`,
      type: "dispatch-log",
      url: "#",
      createdAt: dispatchAt,
    };

    const inventoryDoc: TransferDocument = {
      id: generateDocumentId("im"),
      name: `Inventory Movement — ${transfer.transferId}`,
      type: "inventory-movement",
      url: "#",
      createdAt: dispatchAt,
    };

    const dispatchRecord: ErpDispatch = {
      id: generateId("disp"),
      dispatchId: `DSP-${transfer.transferId.replace(/^TRN-/, "")}`,
      transferId: transfer.transferId,
      allocationId: transfer.allocationId ?? "",
      requestId: transfer.requisitionId ?? "",
      materialId: materialId ?? "unknown",
      material: transfer.material ?? transfer.materials[0] ?? "Material",
      quantity: qty,
      unit: transfer.quantityUnit ?? allocation?.unit ?? "units",
      warehouse: transfer.sourceWarehouse,
      destinationHub: transfer.destinationHub,
      status: "DISPATCHED",
      dispatchAt,
      createdAt: transfer.createdAt,
    };

    const updatedInventory = materialId
      ? state.inventory.map((item) =>
          item.id === materialId
            ? {
                ...item,
                committedStock: Math.max(0, item.committedStock - qty),
                currentStock: Math.max(0, item.currentStock - qty),
              }
            : item,
        )
      : state.inventory;

    set({
      transfers: state.transfers.map((entry) =>
        entry.transferId === transferId
          ? {
              ...entry,
              status: "IN_TRANSIT",
              dispatchAt,
              gatePassId,
              timeline: [
                ...entry.timeline,
                dispatchStartedEvent,
                inTransitEvent,
              ],
              documents: [
                ...entry.documents,
                gatePassDoc,
                dispatchLogDoc,
                inventoryDoc,
              ],
            }
          : entry,
      ),
      inventory: updatedInventory,
      dispatches: [
        dispatchRecord,
        ...state.dispatches.filter((entry) => entry.transferId !== transferId),
      ],
      activityLogs: logActivityEntry(
        logActivityEntry(state.activityLogs, {
          user: "Gate Operator",
          module: "Dispatch",
          action: "Dispatch Started",
          remarks: `${getQuantityLabel(transfer)} — ${transfer.material ?? "Material"}`,
          entityId: transferId,
          entityType: "transfer",
        }),
        {
          user: "Dispatch System",
          module: "Inventory",
          action: "Dispatch Out",
          remarks: `${getQuantityLabel(transfer)} — ${transfer.material ?? "Material"} deducted from ${transfer.sourceWarehouse}`,
          entityId: transferId,
          entityType: "transfer",
        },
      ),
    });

    get().appendActivityLog(transferId, {
      action: "Dispatch Confirmed",
      actor: "Gate Operator",
      details: `Gate pass ${gatePassId}. Reserved inventory moved to in-transit.`,
    });
  },

  startDispatch: (transferId) => {
    get().confirmDispatch(transferId);
  },

  updateEta: (transferId, newEta, remarks) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "IN_TRANSIT") {
      throw new Error("ETA can only be updated for in-transit transfers.");
    }

    get().updateTransfer(transferId, {
      eta: newEta,
      expectedArrival: newEta,
    });
    get().appendTimeline(
      transferId,
      createTimelineEvent(
        "DELAY_RECORDED",
        `ETA updated to ${new Date(newEta).toLocaleString("en-IN")}`,
        { actor: "Warehouse Manager", remarks },
      ),
    );
    get().appendActivityLog(transferId, {
      action: "ETA Updated",
      actor: "Warehouse Manager",
      details:
        remarks ?? `New ETA: ${new Date(newEta).toLocaleString("en-IN")}`,
    });
  },

  addRemarks: (transferId, remarks) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "IN_TRANSIT") {
      throw new Error("Remarks can only be added for in-transit transfers.");
    }

    get().appendTimeline(
      transferId,
      createTimelineEvent("DELAY_RECORDED", "Transit remark added", {
        actor: "Warehouse Manager",
        remarks,
      }),
    );
    get().appendActivityLog(transferId, {
      action: "Remark Added",
      actor: "Warehouse Manager",
      details: remarks,
    });
  },

  reportDelay: (transferId, newEta, reason) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "IN_TRANSIT") {
      throw new Error("Delays can only be reported for in-transit transfers.");
    }

    const recordedAt = new Date().toISOString();
    const event = createTimelineEvent("DELAY_RECORDED", reason, {
      actor: "Warehouse Manager",
      remarks: reason,
    });

    get().updateTransfer(transferId, {
      eta: newEta,
      expectedArrival: newEta,
      isDelayed: true,
      delayInfo: { newEta, reason, recordedAt },
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Delay Reported",
      actor: "Warehouse Manager",
      details: `${reason}. Revised ETA: ${new Date(newEta).toLocaleString("en-IN")}`,
    });

    const state = get();
    set({
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Warehouse Manager",
        module: "Transfer",
        action: "Delayed",
        remarks: reason,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  markReachedHub: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "IN_TRANSIT") {
      throw new Error(
        "Only in-transit transfers can be marked as reached hub.",
      );
    }

    const reachedHubAt = new Date().toISOString();
    const event = createTimelineEvent(
      "REACHED_HUB",
      `Arrived at ${transfer.destinationHub}`,
      { actor: "Warehouse Manager" },
    );

    get().updateTransfer(transferId, {
      status: "REACHED_HUB",
      reachedHubAt,
      deliveredAt: reachedHubAt,
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Reached Hub",
      actor: "Warehouse Manager",
      details: `Vehicle arrived at ${transfer.destinationHub}. Awaiting hub receipt.`,
    });

    const state = get();
    set({
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Warehouse Manager",
        module: "Transfer",
        action: "Reached Hub",
        remarks: transfer.destinationHub,
        entityId: transferId,
        entityType: "transfer",
      }),
    });
  },

  markDelivered: (transferId) => {
    get().receiveAtHub(transferId);
  },

  receiveAtHub: (transferId, verification) => {
    const state = get();
    const transfer = state.getTransferById(transferId);
    if (!transfer) return;
    if (!isHubReceivingEligible(transfer) && transfer.status !== "DELIVERED") {
      throw new Error("Only transfers at hub can be received.");
    }

    const allocation = state.allocations.find(
      (entry) => entry.allocationId === transfer.allocationId,
    );
    const requisition = state.requisitions.find(
      (item) =>
        item.allocationId === transfer.allocationId ||
        item.requestId.replace(/^#/, "") === transfer.requisitionId,
    );
    const qty = transfer.quantity ?? allocation?.reservedQty ?? 0;
    const materialId = allocation?.materialId ?? requisition?.materialId;
    const materialName =
      transfer.material ??
      resolveMaterialName(
        allocation?.material ?? requisition?.material ?? "Material",
        allocation?.materialSpec ?? requisition?.materialSpec,
      );

    const hubReceivedAt = new Date().toISOString();
    const deliveredEvent = createTimelineEvent(
      "DELIVERED",
      verification?.condition
        ? `Condition: ${verification.condition}`
        : `Delivered at ${transfer.destinationHub}`,
      {
        actor: "Hub Manager",
        remarks: verification?.remarks,
      },
    );

    const materialDefaults = materialId
      ? resolveHubMaterialDefaults(transfer.destinationHubId, materialId)
      : null;

    const hubEntry: HubInventoryEntry | null =
      materialId && requisition && materialDefaults
        ? {
            hubId: transfer.destinationHubId,
            hubName: transfer.destinationHub,
            materialId,
            materialName,
            sku: resolveSku(materialId),
            quantity: qty,
            minimumRequired: materialDefaults.minimumRequired,
            purchasePrice: materialDefaults.purchasePrice,
            category: materialDefaults.category,
            safetyStock: materialDefaults.safetyStock,
            unit: transfer.quantityUnit ?? allocation?.unit ?? requisition.unit,
            lastUpdated: hubReceivedAt,
          }
        : null;

    set({
      transfers: state.transfers.map((entry) =>
        entry.transferId === transferId
          ? {
              ...entry,
              status: "DELIVERED",
              hubReceivedAt,
              deliveredAt: hubReceivedAt,
              completedAt: hubReceivedAt,
              timeline: [...entry.timeline, deliveredEvent],
            }
          : entry,
      ),
      requisitions: state.requisitions.map((item) =>
        item.allocationId === transfer.allocationId ||
        item.requestId.replace(/^#/, "") === transfer.requisitionId
          ? { ...item, status: "COMPLETED" }
          : item,
      ),
      dispatches: state.dispatches.map((dispatch) =>
        dispatch.transferId === transferId
          ? { ...dispatch, status: "COMPLETED" }
          : dispatch,
      ),
      subHubs: state.subHubs.map((hub) =>
        hub.id === transfer.destinationHubId
          ? { ...hub, lastInventorySync: hubReceivedAt }
          : hub,
      ),
      hubInventory: hubEntry
        ? upsertHubInventory(state.hubInventory, hubEntry)
        : state.hubInventory,
      activityLogs: logActivityEntry(
        logActivityEntry(state.activityLogs, {
          user: "Hub Manager",
          module: "Hub Receiving",
          action: "Hub Received",
          remarks: `${getQuantityLabel(transfer)} — ${materialName}`,
          entityId: transferId,
          entityType: "transfer",
        }),
        {
          user: "Hub Manager",
          module: "Transfer",
          action: "Completed",
          remarks: transfer.transferId,
          entityId: transferId,
          entityType: "transfer",
        },
      ),
    });

    get().appendActivityLog(transferId, {
      action: "Hub Receipt Confirmed",
      actor: "Hub Manager",
      details: `${getQuantityLabel(transfer)} added to hub inventory. Transfer closed.`,
    });
  },

  getDispatchQueueTransfers: () =>
    get().transfers.filter((transfer) =>
      DISPATCH_QUEUE_STATUSES.includes(transfer.status),
    ),

  getHubReceivingTransfers: () =>
    get().transfers.filter((transfer) => isHubReceivingEligible(transfer)),

  getPendingDispatchTransfers: () =>
    get().transfers.filter(
      (transfer) => transfer.status === "TRANSFER_CREATED",
    ),

  getInventoryActivities: () =>
    buildOutboundTransferActivities(get().transfers, 8),

  getCriticalRequisitions: () =>
    get()
      .requisitions.filter(
        (item) => item.priority === "critical" && item.status === "PENDING",
      )
      .slice(0, 5),

  getDashboardStats: () => {
    const state = get();
    const reqStats = computeRequisitionStats(state.requisitions);
    const transferStats = computeTransferStats(state.transfers);
    const lowStock = state.inventory.filter(
      (item) => getAvailableStock(item) <= item.minimumStock,
    ).length;
    const totalProducts = state.inventory.length;

    return [
      {
        id: "total-products",
        label: "Total Products",
        value: String(totalProducts).padStart(2, "0"),
        subtitle: "Products in warehouse catalog",
        icon: "inventory" as const,
        variant: "default" as const,
        href: "/central-warehouse/products",
      },
      {
        id: "pending-requisitions",
        label: "Pending Requisitions",
        value: String(reqStats.pendingRequests).padStart(2, "0"),
        subtitle: "Waiting for approval",
        icon: "requisitions" as const,
        variant: "default" as const,
        href: "/central-warehouse/requisitions?status=PENDING",
      },
      {
        id: "todays-dispatch",
        label: "Dispatched Today",
        value: String(transferStats.dispatchedToday).padStart(2, "0"),
        subtitle: "Confirmed dispatches today",
        icon: "dispatch" as const,
        variant: "default" as const,
        href: "/central-warehouse/dispatch",
      },
      {
        id: "low-stock-items",
        label: "Low Stock Items",
        value: String(lowStock).padStart(2, "0"),
        subtitle: "Require replenishment",
        icon: "low-stock" as const,
        variant: "warning" as const,
        href: "/central-warehouse/inventory?alert=low-stock",
      },
    ];
  },

  getSubHubDashboardKpis: () => {
    const state = get();
    const subHubs = resolveSubHubs(state.subHubs);
    const hubInventory = normalizeHubInventory(state.hubInventory);

    return computeSubHubDashboardKpis(
      subHubs,
      hubInventory,
      state.requisitions,
    );
  },

  getSubHubSummaries: () => {
    const state = get();
    const subHubs = resolveSubHubs(state.subHubs);
    const hubInventory = normalizeHubInventory(state.hubInventory);

    return computeSubHubSummaries(
      subHubs,
      hubInventory,
      state.transfers,
      state.requisitions,
    );
  },

  getSubHubTableRows: () => {
    const state = get();
    const subHubs = resolveSubHubs(state.subHubs);
    const hubInventory = normalizeHubInventory(state.hubInventory);

    return computeSubHubTableRows(
      subHubs,
      hubInventory,
      state.transfers,
      state.requisitions,
    );
  },

  addSubHub: (draft) => {
    const state = get();
    const { hub, inventory, drivers, vehicles, result } = buildHubFromDraft(
      draft,
      resolveSubHubs(state.subHubs),
    );

    const nameConflict = resolveSubHubs(state.subHubs).some(
      (item) => item.name.toLowerCase() === hub.name.toLowerCase(),
    );
    if (nameConflict) {
      throw new Error(`A hub named "${hub.name}" already exists.`);
    }

    const codeConflict = resolveSubHubs(state.subHubs).some(
      (item) => item.nodeId.toLowerCase() === hub.nodeId.toLowerCase(),
    );
    if (codeConflict) {
      throw new Error(`Hub code "${hub.nodeId}" is already in use.`);
    }

    set({
      subHubs: [hub, ...resolveSubHubs(state.subHubs)],
      hubInventory: [
        ...inventory,
        ...normalizeHubInventory(state.hubInventory),
      ],
      drivers: [...drivers, ...state.drivers],
      vehicles: [...vehicles, ...state.vehicles],
      activityLogs: logActivityEntry(state.activityLogs, {
        user: "Super Admin",
        module: "Sub-Hub Network",
        action: "Hub created",
        remarks: `${hub.name} (${hub.nodeId}) onboarded via hub wizard`,
        entityId: hub.id,
        entityType: "sub-hub",
      }),
    });

    return result;
  },

  adjustHubInventory: ({
    hubId,
    materialId,
    newQuantity,
    reason,
    adminName,
  }) => {
    const state = get();
    const entry = state.hubInventory.find(
      (item) => item.hubId === hubId && item.materialId === materialId,
    );
    if (!entry) return;

    const quantity = Math.max(0, Math.round(newQuantity));
    const delta = quantity - entry.quantity;
    const now = new Date().toISOString();

    set({
      hubInventory: state.hubInventory.map((item) =>
        item.hubId === hubId && item.materialId === materialId
          ? { ...item, quantity, lastUpdated: now }
          : item,
      ),
      subHubs: state.subHubs.map((hub) =>
        hub.id === hubId ? { ...hub, lastInventorySync: now } : hub,
      ),
      activityLogs: logActivityEntry(state.activityLogs, {
        user: adminName ?? "Hub Manager",
        module: "Hub Inventory",
        action: "Inventory Adjusted",
        remarks: `${entry.materialName} at ${entry.hubName}: ${delta >= 0 ? "+" : ""}${delta} ${entry.unit}${reason ? ` — ${reason}` : ""}`,
        entityId: `${hubId}:${materialId}`,
        entityType: "hub-inventory",
      }),
    });
  },

  resetDatabase: () => {
    set({ ...MOCK_DATABASE_SEED });
  },
}));

import { setInventorySource } from "@/mock/inventory";

setInventorySource(() => useWarehouseErpStore.getState().inventory);

let erpStoreRepaired = false;

if (!erpStoreRepaired) {
  const erpRepairPatch = repairErpStoreState(useWarehouseErpStore.getState());
  if (erpRepairPatch) {
    useWarehouseErpStore.setState(erpRepairPatch);
  }
  erpStoreRepaired = true;
}

export { FLEET_DRIVERS, FLEET_VEHICLES } from "@/mock/transfer-fleet";

export function useTransferListStore<T>(
  selector: (state: WarehouseErpState) => T,
): T {
  return useWarehouseErpStore(selector);
}

export function useAllocationRegistryStore<T>(
  selector: (state: WarehouseErpState) => T,
): T {
  return useWarehouseErpStore(selector);
}

export function useInventoryActivityStore<T>(
  selector: (state: WarehouseErpState) => T,
): T {
  return useWarehouseErpStore(selector);
}
