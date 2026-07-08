import { create } from "zustand";

import { FLEET_DRIVERS, FLEET_VEHICLES } from "@/mock/transfer-fleet";
import { TRANSFER_LIST } from "@/mock/transfers";
import { useInventoryActivityStore } from "@/store/inventory-activity-store";
import type {
  FleetDriver,
  FleetVehicle,
  LoadingChecklist,
  TransferActivityLog,
  TransferDocument,
  TransferListItem,
  TransferStatus,
  TransferTimelineEvent,
} from "@/types/warehouse.types";
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
} from "@/utils/transfer-actions";

interface TransferListState {
  transfers: TransferListItem[];
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
  /** @deprecated Use confirmDispatch */
  startDispatch: (transferId: string) => void;
  updateEta: (transferId: string, newEta: string, remarks?: string) => void;
  addRemarks: (transferId: string, remarks: string) => void;
  reportDelay: (transferId: string, newEta: string, reason: string) => void;
  markReachedHub: (transferId: string) => void;
  /** @deprecated Use markReachedHub */
  markDelivered: (transferId: string) => void;
  receiveAtHub: (
    transferId: string,
    verification?: { condition?: string; remarks?: string },
  ) => void;
  getDispatchQueueTransfers: () => TransferListItem[];
  getHubReceivingTransfers: () => TransferListItem[];
  getPendingDispatchTransfers: () => TransferListItem[];
  resetTransfers: () => void;
}

function generateGatePassId(): string {
  return `GP-${Date.now().toString().slice(-8)}`;
}

function generateDocumentId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function getQuantityLabel(transfer: TransferListItem): string {
  return `${transfer.quantity ?? 0} ${transfer.quantityUnit ?? "units"}`;
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
    if (
      !["CREATED", "VEHICLE_ASSIGNED", "DRIVER_ASSIGNED"].includes(
        transfer.status,
      )
    ) {
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

    const nextStatus: TransferStatus = hasDriverAssigned(transfer)
      ? "DRIVER_ASSIGNED"
      : "VEHICLE_ASSIGNED";

    get().updateTransfer(transferId, {
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      status: nextStatus,
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Vehicle Assigned",
      actor: "Dispatch Manager",
      details: vehicle.vehicleNumber,
    });
  },

  assignDriver: (transferId, driver) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (
      !["CREATED", "VEHICLE_ASSIGNED", "DRIVER_ASSIGNED"].includes(
        transfer.status,
      )
    ) {
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
      status: "DRIVER_ASSIGNED",
      timeline: [...transfer.timeline, event],
    });
    get().appendActivityLog(transferId, {
      action: "Driver Assigned",
      actor: "Dispatch Manager",
      details: driver.name,
    });
  },

  markReadyForDispatch: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!hasVehicleAssigned(transfer) || !hasDriverAssigned(transfer)) {
      throw new Error("Vehicle and driver must be assigned first.");
    }
    if (
      ![
        "CREATED",
        "VEHICLE_ASSIGNED",
        "DRIVER_ASSIGNED",
        "READY_FOR_DISPATCH",
      ].includes(transfer.status)
    ) {
      throw new Error("Transfer is not eligible for dispatch readiness.");
    }

    const readyEvent = createTimelineEvent(
      "READY_FOR_DISPATCH",
      "Transfer queued for dispatch",
      { actor: "Dispatch Manager" },
    );
    get().updateTransfer(transferId, {
      status: "PENDING_DISPATCH",
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
  },

  confirmDispatch: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!canDispatchNow(transfer)) {
      throw new Error(
        "Dispatch requires ready-for-dispatch status with vehicle and driver assigned.",
      );
    }

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

    get().updateTransfer(transferId, {
      status: "IN_TRANSIT",
      dispatchAt,
      gatePassId,
      timeline: [...transfer.timeline, dispatchStartedEvent, inTransitEvent],
      documents: [
        ...transfer.documents,
        gatePassDoc,
        dispatchLogDoc,
        inventoryDoc,
      ],
    });
    get().appendActivityLog(transferId, {
      action: "Dispatch Confirmed",
      actor: "Gate Operator",
      details: `Gate pass ${gatePassId}. Inventory deducted from ${transfer.sourceWarehouse}.`,
    });

    useInventoryActivityStore.getState().logDispatchOut({
      transferId: transfer.transferId,
      material: transfer.material ?? transfer.materials[0] ?? "Material",
      quantity: getQuantityLabel(transfer),
      warehouse: transfer.sourceWarehouse,
      by: "Dispatch System",
    });
  },

  startDispatch: (transferId) => {
    get().confirmDispatch(transferId);
  },

  updateEta: (transferId, newEta, remarks) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "DISPATCH_STARTED"
    ) {
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
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "DISPATCH_STARTED"
    ) {
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
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "DISPATCH_STARTED"
    ) {
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
  },

  markReachedHub: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "DISPATCH_STARTED"
    ) {
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
  },

  markDelivered: (transferId) => {
    get().markReachedHub(transferId);
  },

  receiveAtHub: (transferId, verification) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!isHubReceivingEligible(transfer) && transfer.status !== "DELIVERED") {
      throw new Error("Only transfers at hub can be received.");
    }

    const hubReceivedAt = new Date().toISOString();
    const hubEvent = createTimelineEvent(
      "HUB_RECEIVED",
      verification?.condition
        ? `Condition: ${verification.condition}`
        : `Received at ${transfer.destinationHub}`,
      {
        actor: "Hub Manager",
        remarks: verification?.remarks,
      },
    );
    const completedEvent = createTimelineEvent("COMPLETED", undefined, {
      actor: "Hub Manager",
    });

    get().updateTransfer(transferId, {
      status: "COMPLETED",
      hubReceivedAt,
      completedAt: hubReceivedAt,
      timeline: [...transfer.timeline, hubEvent, completedEvent],
    });
    get().appendActivityLog(transferId, {
      action: "Hub Receipt Confirmed",
      actor: "Hub Manager",
      details: `${getQuantityLabel(transfer)} added to hub inventory. Transfer closed.`,
    });

    useInventoryActivityStore.getState().logHubReceipt({
      transferId: transfer.transferId,
      material: transfer.material ?? transfer.materials[0] ?? "Material",
      quantity: getQuantityLabel(transfer),
      hub: transfer.destinationHub,
      by: "Hub Manager",
    });
  },

  getDispatchQueueTransfers: () => {
    return get().transfers.filter((transfer) =>
      DISPATCH_QUEUE_STATUSES.includes(transfer.status),
    );
  },

  getHubReceivingTransfers: () => {
    return get().transfers.filter((transfer) =>
      isHubReceivingEligible(transfer),
    );
  },

  getPendingDispatchTransfers: () => {
    return get().transfers.filter(
      (transfer) => transfer.status === "PENDING_DISPATCH",
    );
  },

  resetTransfers: () => {
    set({ transfers: TRANSFER_LIST });
  },
}));

export { FLEET_DRIVERS, FLEET_VEHICLES };
