import { create } from "zustand";

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
  generateDispatch: () => void;
  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceRecord["status"],
  ) => void;
  rescheduleMaintenance: (id: string, expectedCompletion: string) => void;
}

/**
 * Legacy in-memory store — kept for a few non-logistics callers.
 * Logistics screens now use React Query + /admin/logistics APIs.
 * Intentionally starts empty (no seed/mock logistics data).
 */
export const useLogisticsStore = create<LogisticsStore>(() => ({
  vehicles: [],
  drivers: [],
  warehouseShipments: [],
  customerDeliveries: [],
  criticalShipments: [],
  dispatches: [],
  maintenanceRecords: [],

  addVehicle: () => undefined,
  updateVehicle: () => undefined,
  deleteVehicle: () => undefined,
  addDriver: () => undefined,
  updateDriver: () => undefined,
  deleteDriver: () => undefined,
  assignVehicleToShipment: () => undefined,
  assignDriverToShipment: () => undefined,
  assignVehicleToDriver: () => undefined,
  assignVehicleToDispatch: () => undefined,
  assignDriverToDispatch: () => undefined,
  generateDispatch: () => undefined,
  updateMaintenanceStatus: () => undefined,
  rescheduleMaintenance: () => undefined,
}));
