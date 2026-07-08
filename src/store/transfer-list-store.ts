import { create } from "zustand";

import { FLEET_DRIVERS, FLEET_VEHICLES } from "@/mock/transfer-fleet";
import { TRANSFER_LIST } from "@/mock/transfers";
import type {
  FleetDriver,
  FleetVehicle,
  TransferActivityLog,
  TransferDocument,
  TransferListItem,
  TransferStatus,
  TransferTimelineEvent,
} from "@/types/warehouse.types";
import {
  canStartDispatch,
  createTimelineEvent,
  hasDriverAssigned,
  hasVehicleAssigned,
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
  startDispatch: (transferId: string) => void;
  markDelivered: (transferId: string) => void;
  receiveAtHub: (transferId: string) => void;
  getPendingDispatchTransfers: () => TransferListItem[];
  resetTransfers: () => void;
}

function generateGatePassId(): string {
  return `GP-${Date.now().toString().slice(-8)}`;
}

function generateDocumentId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
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
    );

    const nextStatus: TransferStatus = "DRIVER_ASSIGNED";

    get().updateTransfer(transferId, {
      driverId: driver.id,
      assignedDriver: {
        name: driver.name,
        employeeId: driver.employeeId,
      },
      status: nextStatus,
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

    const readyEvent = createTimelineEvent("READY_FOR_DISPATCH");
    get().updateTransfer(transferId, {
      status: "PENDING_DISPATCH",
      timeline: [...transfer.timeline, readyEvent],
    });
    get().appendActivityLog(transferId, {
      action: "Ready For Dispatch",
      actor: "Dispatch Manager",
      details: "Transfer queued for dispatch",
    });
  },

  startDispatch: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (!canStartDispatch(transfer)) {
      throw new Error(
        "Dispatch requires vehicle, driver, and Pending Dispatch status.",
      );
    }

    const dispatchAt = new Date().toISOString();
    const gatePassId = generateGatePassId();
    const dispatchEvent = createTimelineEvent(
      "DISPATCH_STARTED",
      `Gate pass ${gatePassId} issued`,
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

    get().updateTransfer(transferId, {
      status: "IN_TRANSIT",
      dispatchAt,
      gatePassId,
      timeline: [...transfer.timeline, dispatchEvent],
      documents: [...transfer.documents, gatePassDoc, dispatchLogDoc],
    });
    get().appendActivityLog(transferId, {
      action: "Dispatch Started",
      actor: "Gate Operator",
      details: `Gate pass ${gatePassId} created. Transfer in transit.`,
    });
  },

  markDelivered: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "DISPATCH_STARTED"
    ) {
      throw new Error("Only in-transit transfers can be marked delivered.");
    }

    const deliveredAt = new Date().toISOString();
    const deliveredEvent = createTimelineEvent(
      "DELIVERED",
      `Delivered at ${transfer.destinationHub}`,
    );
    const reachedEvent = createTimelineEvent(
      "REACHED_DESTINATION",
      transfer.destinationHub,
    );

    get().updateTransfer(transferId, {
      status: "DELIVERED",
      deliveredAt,
      timeline: [...transfer.timeline, reachedEvent, deliveredEvent],
    });
    get().appendActivityLog(transferId, {
      action: "Marked Delivered",
      actor: "Driver",
      details: `Arrived at ${transfer.destinationHub}`,
    });
  },

  receiveAtHub: (transferId) => {
    const transfer = get().getTransferById(transferId);
    if (!transfer) return;
    if (transfer.status !== "DELIVERED" && transfer.status !== "HUB_RECEIVED") {
      throw new Error("Only delivered transfers can be received at hub.");
    }

    const hubReceivedAt = new Date().toISOString();
    const hubEvent = createTimelineEvent(
      "HUB_RECEIVED",
      `Received at ${transfer.destinationHub}`,
    );
    const completedEvent = createTimelineEvent("COMPLETED");

    get().updateTransfer(transferId, {
      status: "COMPLETED",
      hubReceivedAt,
      completedAt: hubReceivedAt,
      timeline: [...transfer.timeline, hubEvent, completedEvent],
    });
    get().appendActivityLog(transferId, {
      action: "Hub Receipt Confirmed",
      actor: "Hub Manager",
      details: `${transfer.quantity ?? 0} ${transfer.quantityUnit ?? "units"} added to hub inventory. Transfer closed.`,
    });
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
