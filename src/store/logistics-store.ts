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
  assignVehicleToDriver: (driverId: string, vehicleId: string) => void;

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

  assignVehicleToDriver: (driverId, vehicleId) => {
    const vehicle = get().vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              assignedVehicleId: vehicleId,
              assignedVehicleNumber: vehicle.vehicleNumber,
            }
          : d,
      ),
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, assignedDriverId: driverId, status: "assigned" }
          : v,
      ),
    }));
  },

  assignVehicleToDispatch: (dispatchId, vehicleId) => {
    const vehicle = get().vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.dispatchId === dispatchId
          ? {
              ...d,
              vehicleId,
              vehicleNumber: vehicle.vehicleNumber,
              status: d.status === "pending" ? "assigned" : d.status,
            }
          : d,
      ),
    }));
  },

  assignDriverToDispatch: (dispatchId, driverId) => {
    const driver = get().drivers.find((d) => d.id === driverId);
    if (!driver) return;

    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.dispatchId === dispatchId
          ? { ...d, driverId, driverName: driver.name }
          : d,
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
