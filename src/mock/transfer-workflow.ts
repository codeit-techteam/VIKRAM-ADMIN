import type {
  TransferListItem,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
  TransferWorkflowResult,
} from "@/types/warehouse.types";
import { createTimelineEvent } from "@/utils/transfer-actions";

import {
  assignDriver,
  assignVehicle,
  FLEET_DRIVERS,
  FLEET_VEHICLES,
  getAvailableDrivers,
  getAvailableVehicles,
} from "@/mock/transfer-fleet";

export const TRANSFER_WORKFLOW_STEP_LABELS = [
  "Transfer Details",
  "Vehicle",
  "Driver",
  "Review",
  "Success",
] as const;

let transferIdCounter = 2044;

export function generateTransferId(): string {
  transferIdCounter += 1;
  return `TRN-${transferIdCounter}`;
}

export function getDefaultFormValues(): TransferWorkflowFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  return {
    transferType: "critical",
    dispatchDate: new Date().toISOString().split("T")[0],
    expectedArrival: dayAfter.toISOString().split("T")[0],
    logisticsRemarks:
      "Site manager requested delivery before 8:00 AM due to heavy crane activity scheduled. Use Gate 4 for unloading steel rods. Material requires dry coverage during transit.",
    vehicleId: "",
    driverId: "",
  };
}

export function estimateTripTimeHours(
  sourceWarehouse: string,
  destinationHub: string,
): number {
  const routeKey = `${sourceWarehouse}-${destinationHub}`.toLowerCase();
  if (routeKey.includes("gurgaon") && routeKey.includes("noida")) return 2.5;
  if (routeKey.includes("delhi")) return 1.5;
  return 2;
}

export function buildDraftTransfer(
  transferId: string,
  context: TransferWorkflowContext,
  form: TransferWorkflowFormValues,
): TransferListItem {
  const eta = new Date(form.expectedArrival);
  eta.setHours(18, 30, 0, 0);

  return {
    id: `transfer-draft-${transferId}`,
    transferId,
    allocationId: context.allocationId,
    requisitionId: context.requisitionId,
    sourceWarehouseId: context.sourceWarehouseId,
    sourceWarehouse: context.sourceWarehouse,
    destinationHubId: context.destinationHubId,
    destinationHub: context.destinationHub,
    status: "DRAFT",
    transferType: form.transferType,
    priority: form.transferType,
    material: context.material,
    sku: context.sku,
    quantity: context.quantity,
    quantityUnit: context.unit,
    estimatedWeightKg: context.estimatedWeightKg,
    logisticsRemarks: form.logisticsRemarks,
    dispatchDate: form.dispatchDate,
    expectedArrival: form.expectedArrival,
    createdAt: new Date().toISOString(),
    eta: eta.toISOString(),
    materials: [`${context.material} x${context.quantity}`],
    timeline: [],
    activityLogs: [],
    documents: [],
  };
}

export function confirmTransferWorkflow(
  transferId: string,
  context: TransferWorkflowContext,
  form: TransferWorkflowFormValues,
  vehicles = FLEET_VEHICLES,
  drivers = FLEET_DRIVERS,
): {
  transfer: TransferListItem;
  result: TransferWorkflowResult;
  vehicles: typeof FLEET_VEHICLES;
  drivers: typeof FLEET_DRIVERS;
} {
  const vehicle = form.vehicleId
    ? vehicles.find((entry) => entry.id === form.vehicleId)
    : undefined;
  const driver = form.driverId
    ? drivers.find((entry) => entry.id === form.driverId)
    : undefined;

  const createdAt = new Date().toISOString();
  const eta = new Date(form.expectedArrival);
  eta.setHours(18, 30, 0, 0);

  const timeline = [
    createTimelineEvent(
      "TRANSFER_CREATED",
      `Transfer ${transferId} created from allocation ${context.allocationId}`,
    ),
  ];

  if (vehicle) {
    timeline.push(
      createTimelineEvent(
        "VEHICLE_ASSIGNED",
        `Vehicle ${vehicle.vehicleNumber} assigned`,
      ),
    );
  }

  if (driver) {
    timeline.push(
      createTimelineEvent(
        "DRIVER_ASSIGNED",
        `${driver.name} (${driver.employeeId}) assigned`,
      ),
    );
  }

  const transfer: TransferListItem = {
    id: `transfer-${transferId}`,
    transferId,
    allocationId: context.allocationId,
    requisitionId: context.requisitionId,
    sourceWarehouseId: context.sourceWarehouseId,
    sourceWarehouse: context.sourceWarehouse,
    destinationHubId: context.destinationHubId,
    destinationHub: context.destinationHub,
    vehicleNumber: vehicle?.vehicleNumber,
    vehicleId: vehicle?.id,
    driverId: driver?.id,
    assignedDriver: driver
      ? { name: driver.name, employeeId: driver.employeeId }
      : undefined,
    status: "CREATED",
    transferType: form.transferType,
    priority: form.transferType,
    material: context.material,
    sku: context.sku,
    quantity: context.quantity,
    quantityUnit: context.unit,
    estimatedWeightKg: context.estimatedWeightKg,
    logisticsRemarks: form.logisticsRemarks,
    dispatchDate: form.dispatchDate,
    expectedArrival: form.expectedArrival,
    createdAt,
    eta: eta.toISOString(),
    materials: [`${context.material} x${context.quantity}`],
    timeline,
    activityLogs: [
      {
        id: `log-created-${transferId}`,
        action: "Transfer Created",
        actor: "Warehouse Manager",
        timestamp: createdAt,
        details: `From allocation ${context.allocationId}`,
      },
    ],
    documents: [],
  };

  const result: TransferWorkflowResult = {
    transferId,
    allocationId: context.allocationId,
    requisitionId: context.requisitionId,
    vehicleNumber: vehicle?.vehicleNumber,
    driverName: driver?.name,
    destinationHub: context.destinationHub,
    material: context.material,
    quantity: context.quantity,
    unit: context.unit,
    status: "CREATED",
    createdAt,
  };

  let updatedVehicles = vehicles;
  let updatedDrivers = drivers;

  if (vehicle) {
    updatedVehicles = assignVehicle(vehicle.id, vehicles);
  }
  if (driver) {
    updatedDrivers = assignDriver(driver.id, drivers);
  }

  return {
    transfer,
    result,
    vehicles: updatedVehicles,
    drivers: updatedDrivers,
  };
}

export {
  getAvailableDrivers,
  getAvailableVehicles,
  FLEET_DRIVERS,
  FLEET_VEHICLES,
};
