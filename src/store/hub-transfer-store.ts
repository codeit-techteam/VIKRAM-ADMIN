import { create } from "zustand";

import {
  HUB_TRANSFER_FLEET_DRIVERS,
  HUB_TRANSFER_FLEET_VEHICLES,
  HUB_TRANSFER_LIST,
  HUB_TRANSFER_STATUS_LABELS,
} from "@/mock/hub-transfers";
import type {
  HubTransfer,
  HubTransferFleetDriver,
  HubTransferFleetVehicle,
  HubTransferStatus,
  HubTransferStatusUpdatePayload,
  HubTransferTimelineEvent,
  HubTransferTimelineKey,
} from "@/types/hub-transfer.types";

interface HubTransferStore {
  transfers: HubTransfer[];
  vehicles: HubTransferFleetVehicle[];
  drivers: HubTransferFleetDriver[];

  assignVehicle: (
    transferId: string,
    vehicleId: string,
    updatedBy: string,
  ) => void;
  assignDriver: (
    transferId: string,
    driverId: string,
    updatedBy: string,
  ) => void;
  updateStatus: (
    transferId: string,
    payload: HubTransferStatusUpdatePayload,
  ) => void;
  getTransferById: (id: string) => HubTransfer | undefined;
}

function appendTimeline(
  timeline: HubTransferTimelineEvent[],
  event: HubTransferTimelineEvent,
): HubTransferTimelineEvent[] {
  return [event, ...timeline];
}

function statusToTimelineKey(
  status: HubTransferStatus,
): HubTransferTimelineKey | null {
  const map: Partial<Record<HubTransferStatus, HubTransferTimelineKey>> = {
    ASSIGNED: "DRIVER_ASSIGNED",
    DISPATCHED: "DISPATCHED",
    DELIVERED: "DELIVERED",
  };
  return map[status] ?? null;
}

function computeDelayed(item: HubTransfer): boolean {
  if (item.status === "DELIVERED" || item.status === "CANCELLED") {
    return false;
  }
  return new Date(item.expectedDelivery).getTime() < Date.now();
}

export const useHubTransferStore = create<HubTransferStore>((set, get) => ({
  transfers: [...HUB_TRANSFER_LIST],
  vehicles: [...HUB_TRANSFER_FLEET_VEHICLES],
  drivers: [...HUB_TRANSFER_FLEET_DRIVERS],

  getTransferById: (id) =>
    get().transfers.find((item) => item.id === id || item.transferId === id),

  assignVehicle: (transferId, vehicleId, updatedBy) => {
    const state = get();
    const vehicle = state.vehicles.find((item) => item.id === vehicleId);
    const transfer = state.transfers.find(
      (item) => item.id === transferId || item.transferId === transferId,
    );

    if (!vehicle || !transfer) return;

    const now = new Date().toISOString();
    const nextTimeline = appendTimeline(transfer.timeline, {
      id: `evt-${now}`,
      key: "VEHICLE_ASSIGNED",
      title: "Vehicle Assigned",
      updatedBy,
      timestamp: now,
      remarks: `${vehicle.vehicleNumber} assigned for delivery.`,
      completed: true,
    });

    const nextStatus: HubTransferStatus =
      transfer.status === "PENDING_DISPATCH" ? "ASSIGNED" : transfer.status;

    set({
      transfers: state.transfers.map((item) =>
        item.id === transfer.id
          ? {
              ...item,
              status: nextStatus,
              vehicleId: vehicle.id,
              vehicleNumber: vehicle.vehicleNumber,
              vehicleType: vehicle.vehicleType,
              vehicleCapacityKg: vehicle.capacityKg,
              timeline: nextTimeline,
              isDelayed: computeDelayed({
                ...item,
                status: nextStatus,
              }),
            }
          : item,
      ),
      vehicles: state.vehicles.map((item) =>
        item.id === vehicle.id
          ? {
              ...item,
              status: "assigned",
              currentTrips: item.currentTrips + 1,
            }
          : item,
      ),
    });
  },

  assignDriver: (transferId, driverId, updatedBy) => {
    const state = get();
    const driver = state.drivers.find((item) => item.id === driverId);
    const transfer = state.transfers.find(
      (item) => item.id === transferId || item.transferId === transferId,
    );

    if (!driver || !transfer) return;

    const now = new Date().toISOString();
    const nextTimeline = appendTimeline(transfer.timeline, {
      id: `evt-${now}`,
      key: "DRIVER_ASSIGNED",
      title: "Driver Assigned",
      updatedBy,
      timestamp: now,
      remarks: `${driver.name} assigned. License ${driver.licenseStatus}.`,
      completed: true,
    });

    const nextStatus: HubTransferStatus =
      transfer.status === "PENDING_DISPATCH" || transfer.status === "ASSIGNED"
        ? "ASSIGNED"
        : transfer.status;

    set({
      transfers: state.transfers.map((item) =>
        item.id === transfer.id
          ? {
              ...item,
              status: nextStatus,
              driverId: driver.id,
              driverName: driver.name,
              driverMobile: driver.mobile,
              licenseStatus: driver.licenseStatus,
              timeline: nextTimeline,
              isDelayed: computeDelayed({ ...item, status: nextStatus }),
            }
          : item,
      ),
      drivers: state.drivers.map((item) =>
        item.id === driver.id
          ? {
              ...item,
              availability: "on_trip",
              tripsToday: item.tripsToday + 1,
            }
          : item,
      ),
    });
  },

  updateStatus: (transferId, payload) => {
    const state = get();
    const transfer = state.transfers.find(
      (item) => item.id === transferId || item.transferId === transferId,
    );
    if (!transfer) return;

    const now = new Date().toISOString();
    const timelineKey = statusToTimelineKey(payload.status);
    const nextTimeline = timelineKey
      ? appendTimeline(transfer.timeline, {
          id: `evt-${now}`,
          key: timelineKey,
          title: HUB_TRANSFER_STATUS_LABELS[payload.status],
          updatedBy: payload.updatedBy,
          timestamp: now,
          remarks: payload.remarks,
          completed: true,
        })
      : transfer.timeline;

    const dispatchTime =
      payload.status === "DISPATCHED" && !transfer.dispatchTime
        ? now
        : transfer.dispatchTime;

    set({
      transfers: state.transfers.map((item) =>
        item.id === transfer.id
          ? {
              ...item,
              status: payload.status,
              dispatchTime,
              estimatedArrival:
                payload.estimatedArrival ?? item.estimatedArrival,
              timeline: nextTimeline,
              isDelayed: computeDelayed({
                ...item,
                status: payload.status,
                expectedDelivery:
                  payload.estimatedArrival ?? item.expectedDelivery,
              }),
            }
          : item,
      ),
    });
  },
}));
