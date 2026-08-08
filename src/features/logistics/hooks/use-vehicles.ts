"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  vehiclesService,
  type VehicleCreatePayload,
  type VehicleListParams,
} from "@/services/vehicles.service";

export const vehicleKeys = {
  all: ["admin-vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (params: VehicleListParams) =>
    [...vehicleKeys.lists(), params] as const,
  stats: (params?: { hubId?: string; warehouseHubId?: string }) =>
    [...vehicleKeys.all, "stats", params ?? {}] as const,
  detail: (id: string) => [...vehicleKeys.all, "detail", id] as const,
};

export function useVehicles(params: VehicleListParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehiclesService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useVehicleStats(params?: {
  hubId?: string;
  warehouseHubId?: string;
}) {
  return useQuery({
    queryKey: vehicleKeys.stats(params),
    queryFn: () => vehiclesService.stats(params),
  });
}

export function useVehicle(id: string | null) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ""),
    queryFn: () => vehiclesService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleCreatePayload) =>
      vehiclesService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<VehicleCreatePayload> & { isActive?: boolean };
    }) => vehiclesService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
