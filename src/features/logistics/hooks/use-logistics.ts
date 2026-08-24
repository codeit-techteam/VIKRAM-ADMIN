"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  logisticsService,
  type CustomerLogisticsParams,
  type DispatchLogisticsParams,
  type MaintenanceLogisticsParams,
  type WarehouseLogisticsParams,
} from "@/services/logistics";
import { driverKeys } from "@/features/logistics/hooks/use-drivers";
import { vehicleKeys } from "@/features/logistics/hooks/use-vehicles";

export const logisticsKeys = {
  all: ["logistics"] as const,
  filters: () => [...logisticsKeys.all, "filters"] as const,
  dashboard: () => [...logisticsKeys.all, "dashboard"] as const,
  warehouse: (params: WarehouseLogisticsParams) =>
    [...logisticsKeys.all, "warehouse", params] as const,
  customer: (params: CustomerLogisticsParams) =>
    [...logisticsKeys.all, "customer", params] as const,
  dispatch: (params: DispatchLogisticsParams) =>
    [...logisticsKeys.all, "dispatch", params] as const,
  maintenance: (params: MaintenanceLogisticsParams) =>
    [...logisticsKeys.all, "maintenance", params] as const,
  tracking: (shipmentId: string) =>
    [...logisticsKeys.all, "tracking", shipmentId] as const,
};

export function useLogisticsFilters() {
  return useQuery({
    queryKey: logisticsKeys.filters(),
    queryFn: () => logisticsService.getFilters(),
    staleTime: 60_000,
  });
}

export function useLogisticsDashboard() {
  return useQuery({
    queryKey: logisticsKeys.dashboard(),
    queryFn: () => logisticsService.getDashboard(),
  });
}

export function useWarehouseLogistics(params: WarehouseLogisticsParams) {
  return useQuery({
    queryKey: logisticsKeys.warehouse(params),
    queryFn: () => logisticsService.getWarehouse(params),
    placeholderData: (prev) => prev,
  });
}

export function useCustomerLogistics(params: CustomerLogisticsParams) {
  return useQuery({
    queryKey: logisticsKeys.customer(params),
    queryFn: () => logisticsService.getCustomer(params),
    placeholderData: (prev) => prev,
  });
}

export function useDispatchLogistics(params: DispatchLogisticsParams) {
  return useQuery({
    queryKey: logisticsKeys.dispatch(params),
    queryFn: () => logisticsService.getDispatch(params),
    placeholderData: (prev) => prev,
  });
}

export function useMaintenanceLogistics(params: MaintenanceLogisticsParams) {
  return useQuery({
    queryKey: logisticsKeys.maintenance(params),
    queryFn: () => logisticsService.getMaintenance(params),
    placeholderData: (prev) => prev,
  });
}

export function useShipmentTracking(shipmentId: string, enabled = true) {
  return useQuery({
    queryKey: logisticsKeys.tracking(shipmentId),
    queryFn: () => logisticsService.trackShipment(shipmentId),
    enabled: enabled && Boolean(shipmentId.trim()),
    retry: false,
  });
}

function useInvalidateLogistics() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: logisticsKeys.all });
    void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    void qc.invalidateQueries({ queryKey: driverKeys.all });
  };
}

export function useAssignWarehouseLogistics() {
  const invalidate = useInvalidateLogistics();
  return useMutation({
    mutationFn: ({
      requisitionId,
      vehicleId,
      driverId,
    }: {
      requisitionId: string;
      vehicleId?: string;
      driverId?: string;
    }) =>
      logisticsService.assignWarehouseLogistics(requisitionId, {
        vehicleId,
        driverId,
      }),
    onSuccess: () => invalidate(),
  });
}

export function useAssignOrderDriver() {
  const invalidate = useInvalidateLogistics();
  return useMutation({
    mutationFn: ({
      orderId,
      driverId,
      vehicleId,
    }: {
      orderId: string;
      driverId: string;
      vehicleId?: string;
    }) => logisticsService.assignOrderDriver(orderId, { driverId, vehicleId }),
    onSuccess: () => invalidate(),
  });
}

export function useStartMaintenance() {
  const invalidate = useInvalidateLogistics();
  return useMutation({
    mutationFn: ({
      vehicleId,
      maintenanceReason,
      maintenanceExpectedAt,
    }: {
      vehicleId: string;
      maintenanceReason?: string;
      maintenanceExpectedAt?: string;
    }) =>
      logisticsService.startMaintenance(vehicleId, {
        maintenanceReason,
        maintenanceExpectedAt,
      }),
    onSuccess: () => invalidate(),
  });
}

export function useCompleteMaintenance() {
  const invalidate = useInvalidateLogistics();
  return useMutation({
    mutationFn: (vehicleId: string) =>
      logisticsService.completeMaintenance(vehicleId),
    onSuccess: () => invalidate(),
  });
}
