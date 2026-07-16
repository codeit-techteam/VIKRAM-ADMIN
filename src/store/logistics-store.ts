import { create } from "zustand";

import {
  SEED_CRITICAL_SHIPMENTS,
  SEED_CUSTOMER_DELIVERIES,
  SEED_DISPATCHES,
  SEED_DRIVERS,
  SEED_MAINTENANCE,
  SEED_VEHICLES,
  SEED_WAREHOUSE_SHIPMENTS,
} from "@/mock/logistics";
import type {
  CriticalShipment,
  CustomerDelivery,
  DispatchRecord,
  LogisticsDriver,
  LogisticsVehicle,
  MaintenanceRecord,
  WarehouseShipment,
} from "@/types/logistics.types";

interface LogisticsStore {
  vehicles: LogisticsVehicle[];
  drivers: LogisticsDriver[];
  warehouseShipments: WarehouseShipment[];
  customerDeliveries: CustomerDelivery[];
  criticalShipments: CriticalShipment[];
  dispatches: DispatchRecord[];
  maintenanceRecords: MaintenanceRecord[];

  addVehicle: (vehicle: LogisticsVehicle) => void;
  updateVehicle: (id: string, updates: Partial<LogisticsVehicle>) => void;
  deleteVehicle: (id: string) => void;

  addDriver: (driver: LogisticsDriver) => void;
  updateDriver: (id: string, updates: Partial<LogisticsDriver>) => void;
  deleteDriver: (id: string) => void;

  assignVehicleToShipment: (
    shipmentId: string,
    vehicleId: string,
    type: "warehouse" | "customer",
  ) => void;
  assignDriverToShipment: (
    shipmentId: string,
    driverId: string,
    type: "warehouse" | "customer",
  ) => void;
  assignVehicleToDriver: (
    driverId: string,
    vehicleId: string,
    options?: { reassign?: boolean },
  ) => void;
  reassignVehicleDriver: (driverId: string, vehicleId: string) => void;

  assignVehicleToDispatch: (dispatchId: string, vehicleId: string) => void;
  assignDriverToDispatch: (dispatchId: string, driverId: string) => void;
  generateDispatch: (dispatch: DispatchRecord) => void;

  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceRecord["status"],
  ) => void;
  rescheduleMaintenance: (id: string, newDate: string) => void;
}

export const useLogisticsStore = create<LogisticsStore>((set, get) => ({
  vehicles: [...SEED_VEHICLES],
  drivers: [...SEED_DRIVERS],
  warehouseShipments: [...SEED_WAREHOUSE_SHIPMENTS],
  customerDeliveries: [...SEED_CUSTOMER_DELIVERIES],
  criticalShipments: [...SEED_CRITICAL_SHIPMENTS],
  dispatches: [...SEED_DISPATCHES],
  maintenanceRecords: [...SEED_MAINTENANCE],

  addVehicle: (vehicle) =>
    set((state) => ({ vehicles: [vehicle, ...state.vehicles] })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates } : v,
      ),
    })),

  deleteVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    })),

  addDriver: (driver) =>
    set((state) => ({ drivers: [driver, ...state.drivers] })),

  updateDriver: (id, updates) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
    })),

  deleteDriver: (id) =>
    set((state) => ({
      drivers: state.drivers.filter((d) => d.id !== id),
    })),

  assignVehicleToShipment: (shipmentId, vehicleId, type) => {
    const vehicle = get().vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    if (type === "warehouse") {
      set((state) => ({
        warehouseShipments: state.warehouseShipments.map((s) =>
          s.shipmentId === shipmentId
            ? {
                ...s,
                vehicleId,
                vehicleNumber: vehicle.vehicleNumber,
                status: s.status === "pending" ? "assigned" : s.status,
              }
            : s,
        ),
        vehicles: state.vehicles.map((v) =>
          v.id === vehicleId
            ? { ...v, status: "assigned", currentShipmentId: shipmentId }
            : v,
        ),
      }));
    } else {
      set((state) => ({
        customerDeliveries: state.customerDeliveries.map((d) =>
          d.orderId === shipmentId
            ? {
                ...d,
                vehicleId,
                vehicleNumber: vehicle.vehicleNumber,
                status: d.status === "packed" ? "assigned" : d.status,
              }
            : d,
        ),
        vehicles: state.vehicles.map((v) =>
          v.id === vehicleId
            ? { ...v, status: "assigned", currentShipmentId: shipmentId }
            : v,
        ),
      }));
    }
  },

  assignDriverToShipment: (shipmentId, driverId, type) => {
    const driver = get().drivers.find((d) => d.id === driverId);
    if (!driver) return;

    if (type === "warehouse") {
      set((state) => ({
        warehouseShipments: state.warehouseShipments.map((s) =>
          s.shipmentId === shipmentId
            ? { ...s, driverId, driverName: driver.name }
            : s,
        ),
        drivers: state.drivers.map((d) =>
          d.id === driverId ? { ...d, status: "driving" } : d,
        ),
      }));
    } else {
      set((state) => ({
        customerDeliveries: state.customerDeliveries.map((d) =>
          d.orderId === shipmentId
            ? { ...d, driverId, driverName: driver.name }
            : d,
        ),
        drivers: state.drivers.map((d) =>
          d.id === driverId ? { ...d, status: "driving" } : d,
        ),
      }));
    }
  },

  assignVehicleToDriver: (driverId, vehicleId, options) => {
    const { vehicles, drivers } = get();
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const driver = drivers.find((d) => d.id === driverId);
    if (!vehicle || !driver) return;

    const prevDriverId = vehicle.assignedDriverId;
    const prevVehicleId = driver.assignedVehicleId;

    set((state) => ({
      drivers: state.drivers.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            assignedVehicleId: vehicleId,
            assignedVehicleNumber: vehicle.vehicleNumber,
            status: d.status === "available" ? "available" : d.status,
          };
        }
        if (options?.reassign && d.id === prevDriverId && d.id !== driverId) {
          return {
            ...d,
            assignedVehicleId: null,
            assignedVehicleNumber: null,
          };
        }
        if (d.assignedVehicleId === vehicleId && d.id !== driverId) {
          return {
            ...d,
            assignedVehicleId: null,
            assignedVehicleNumber: null,
          };
        }
        return d;
      }),
      vehicles: state.vehicles.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            assignedDriverId: driverId,
            assignedDriverName: driver.name,
            status: v.status === "available" ? "assigned" : v.status,
          };
        }
        if (options?.reassign && v.id === prevVehicleId && v.id !== vehicleId) {
          return {
            ...v,
            assignedDriverId: null,
            assignedDriverName: null,
            status: v.status === "assigned" ? "available" : v.status,
          };
        }
        if (v.assignedDriverId === driverId && v.id !== vehicleId) {
          return {
            ...v,
            assignedDriverId: null,
            assignedDriverName: null,
            status: v.status === "assigned" ? "available" : v.status,
          };
        }
        return v;
      }),
    }));
  },

  reassignVehicleDriver: (driverId, vehicleId) => {
    get().assignVehicleToDriver(driverId, vehicleId, { reassign: true });
  },

  assignVehicleToDispatch: (dispatchId, vehicleId) => {
    const vehicle = get().vehicles.find((v) => v.id === vehicleId);
    if (!vehicle || vehicle.status !== "available") return;

    const previous = get().dispatches.find((d) => d.dispatchId === dispatchId);
    if (
      !previous ||
      previous.status === "in_transit" ||
      previous.status === "dispatched" ||
      previous.status === "completed" ||
      previous.status === "cancelled"
    ) {
      return;
    }

    const previousVehicleId = previous.vehicleId;
    const previousDriverId = previous.driverId;

    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.dispatchId === dispatchId
          ? {
              ...d,
              vehicleId,
              vehicleNumber: vehicle.vehicleNumber,
              // Changing vehicle clears prior driver — reassign after vehicle
              driverId: null,
              driverName: null,
              status: d.status === "pending" ? "assigned" : d.status,
            }
          : d,
      ),
      vehicles: state.vehicles.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            status: "assigned" as const,
            currentShipmentId: dispatchId,
            assignedDriverId: null,
            assignedDriverName: null,
          };
        }
        if (previousVehicleId && v.id === previousVehicleId) {
          return {
            ...v,
            status: "available" as const,
            currentShipmentId: null,
            assignedDriverId: null,
            assignedDriverName: null,
          };
        }
        return v;
      }),
      drivers: state.drivers.map((d) =>
        previousDriverId && d.id === previousDriverId
          ? {
              ...d,
              status: "available" as const,
              assignedVehicleId: null,
              assignedVehicleNumber: null,
            }
          : d,
      ),
    }));
  },

  assignDriverToDispatch: (dispatchId, driverId) => {
    const driver = get().drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const dispatch = get().dispatches.find((d) => d.dispatchId === dispatchId);
    if (!dispatch) return;

    // Drivers can only be assigned once vehicle is set, and never while in transit/completed
    if (
      !dispatch.vehicleId ||
      dispatch.status === "in_transit" ||
      dispatch.status === "dispatched" ||
      dispatch.status === "completed" ||
      dispatch.status === "cancelled"
    ) {
      return;
    }

    const previousDriverId = dispatch.driverId;
    const vehicleId = dispatch.vehicleId;
    const vehicleNumber = dispatch.vehicleNumber;

    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.dispatchId === dispatchId
          ? {
              ...d,
              driverId,
              driverName: driver.name,
              status: d.status === "pending" ? "assigned" : d.status,
            }
          : d,
      ),
      drivers: state.drivers.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            status: "available" as const,
            assignedVehicleId: vehicleId,
            assignedVehicleNumber: vehicleNumber,
          };
        }
        if (previousDriverId && d.id === previousDriverId) {
          return {
            ...d,
            status: "available" as const,
            assignedVehicleId: null,
            assignedVehicleNumber: null,
          };
        }
        return d;
      }),
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              assignedDriverId: driverId,
              assignedDriverName: driver.name,
              status: "assigned" as const,
            }
          : v,
      ),
    }));
  },

  generateDispatch: (dispatch) =>
    set((state) => ({
      dispatches: [dispatch, ...state.dispatches],
    })),

  updateMaintenanceStatus: (id, status) =>
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.map((r) =>
        r.id === id ? { ...r, status } : r,
      ),
    })),

  rescheduleMaintenance: (id, newDate) =>
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.map((r) =>
        r.id === id
          ? { ...r, expectedCompletion: newDate, status: "scheduled" }
          : r,
      ),
    })),
}));
