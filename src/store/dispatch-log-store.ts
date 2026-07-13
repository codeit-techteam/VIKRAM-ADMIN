import { create } from "zustand";

import {
  DISPATCH_LOG_LIST,
  DISPATCH_LOG_STATUS_LABELS,
} from "@/mock/dispatch-logs";
import type {
  DispatchAssignmentPayload,
  DispatchLog,
  DispatchLogStatus,
  DispatchLogStatusUpdatePayload,
  DispatchLogTimelineEvent,
} from "@/types/dispatch-log.types";

interface DispatchLogStore {
  logs: DispatchLog[];
  updateStatus: (
    dispatchId: string,
    payload: DispatchLogStatusUpdatePayload,
  ) => void;
  assignDispatch: (
    dispatchId: string,
    payload: DispatchAssignmentPayload,
  ) => void;
  updateDeliveryNotes: (dispatchId: string, notes: string) => void;
  getLogById: (id: string) => DispatchLog | undefined;
}

function computeDelayed(log: DispatchLog): boolean {
  if (log.status === "DELIVERED") return false;
  return new Date(log.expectedDelivery).getTime() < Date.now();
}

function appendTimeline(
  timeline: DispatchLogTimelineEvent[],
  event: DispatchLogTimelineEvent,
): DispatchLogTimelineEvent[] {
  return [event, ...timeline];
}

export const useDispatchLogStore = create<DispatchLogStore>((set, get) => ({
  logs: [...DISPATCH_LOG_LIST],

  getLogById: (id) =>
    get().logs.find((item) => item.id === id || item.dispatchId === id),

  updateStatus: (dispatchId, payload) => {
    const now = new Date().toISOString();
    const state = get();
    const log = state.logs.find(
      (item) => item.id === dispatchId || item.dispatchId === dispatchId,
    );
    if (!log) return;

    const event: DispatchLogTimelineEvent = {
      id: `tl-manual-${now}`,
      status: payload.status,
      title: DISPATCH_LOG_STATUS_LABELS[payload.status],
      updatedBy: payload.updatedBy,
      timestamp: now,
      remarks: payload.remarks,
      isManual: true,
    };

    const dispatchTime =
      payload.status === "DISPATCHED" && !log.dispatchTime
        ? now
        : log.dispatchTime;

    set({
      logs: state.logs.map((item) =>
        item.id === log.id
          ? {
              ...item,
              status: payload.status,
              dispatchTime,
              lastUpdated: now,
              deliveryNotes: payload.remarks || item.deliveryNotes,
              timeline: appendTimeline(item.timeline, event),
              isDelayed: computeDelayed({
                ...item,
                status: payload.status,
              }),
            }
          : item,
      ),
    });
  },

  assignDispatch: (dispatchId, payload) => {
    const now = new Date().toISOString();
    const state = get();
    const log = state.logs.find(
      (item) => item.id === dispatchId || item.dispatchId === dispatchId,
    );
    if (!log || log.status !== "READY_FOR_DISPATCH") return;

    const event: DispatchLogTimelineEvent = {
      id: `tl-assign-${now}`,
      status: "ASSIGNED",
      title: DISPATCH_LOG_STATUS_LABELS.ASSIGNED,
      updatedBy: payload.updatedBy,
      timestamp: now,
      remarks: payload.remarks,
      isManual: true,
    };

    set({
      logs: state.logs.map((item) =>
        item.id === log.id
          ? {
              ...item,
              status: "ASSIGNED",
              vehicleId: payload.vehicleId,
              vehicleNumber: payload.vehicleNumber,
              vehicleType: payload.vehicleType,
              driverId: payload.driverId,
              driverName: payload.driverName,
              driverMobile: payload.driverMobile,
              dispatchTime: payload.expectedDispatchTime,
              lastUpdated: now,
              deliveryNotes: payload.remarks || item.deliveryNotes,
              timeline: appendTimeline(item.timeline, event),
              isDelayed: computeDelayed({
                ...item,
                status: "ASSIGNED",
                dispatchTime: payload.expectedDispatchTime,
              }),
            }
          : item,
      ),
    });
  },

  updateDeliveryNotes: (dispatchId, notes) => {
    const now = new Date().toISOString();
    set({
      logs: get().logs.map((item) =>
        item.id === dispatchId || item.dispatchId === dispatchId
          ? { ...item, deliveryNotes: notes, lastUpdated: now }
          : item,
      ),
    });
  },
}));
