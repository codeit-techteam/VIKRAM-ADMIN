"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  driversService,
  type DriverCreatePayload,
  type DriverListParams,
} from "@/services/drivers.service";

export const driverKeys = {
  all: ["admin-drivers"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  list: (params: DriverListParams) =>
    [...driverKeys.lists(), params] as const,
  stats: (params?: { hubId?: string; warehouseHubId?: string }) =>
    [...driverKeys.all, "stats", params ?? {}] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
};

export function useDrivers(params: DriverListParams) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => driversService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useDriverStats(params?: {
  hubId?: string;
  warehouseHubId?: string;
}) {
  return useQuery({
    queryKey: driverKeys.stats(params),
    queryFn: () => driversService.stats(params),
  });
}

export function useDriver(id: string | null) {
  return useQuery({
    queryKey: driverKeys.detail(id ?? ""),
    queryFn: () => driversService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverCreatePayload) =>
      driversService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.all });
      void qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      void qc.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<DriverCreatePayload>;
    }) => driversService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.all });
      void qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      void qc.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driversService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: driverKeys.all });
      void qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      void qc.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
}
