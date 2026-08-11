"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adjustLoyaltyPoints,
  getLoyaltyByCustomerId,
  getLoyaltyCustomers,
  getLoyaltyStats,
  type LoyaltyFilters,
  type LoyaltyQueryParams,
} from "@/features/loyalty/services/loyalty.service";

export const loyaltyKeys = {
  all: ["admin-loyalty"] as const,
  stats: () => [...loyaltyKeys.all, "stats"] as const,
  list: (params: LoyaltyQueryParams) =>
    [...loyaltyKeys.all, "list", params] as const,
  detail: (customerId: string) =>
    [...loyaltyKeys.all, "detail", customerId] as const,
};

const REFETCH_MS = 30_000;

export function useLoyaltyStats() {
  return useQuery({
    queryKey: loyaltyKeys.stats(),
    queryFn: getLoyaltyStats,
    refetchInterval: REFETCH_MS,
  });
}

export function useLoyaltyCustomers(params: LoyaltyQueryParams) {
  return useQuery({
    queryKey: loyaltyKeys.list(params),
    queryFn: () => getLoyaltyCustomers(params),
    placeholderData: (prev) => prev,
    refetchInterval: REFETCH_MS,
  });
}

export function useLoyaltyDetail(customerId: string | null, enabled = true) {
  return useQuery({
    queryKey: loyaltyKeys.detail(customerId ?? ""),
    queryFn: () => getLoyaltyByCustomerId(customerId!),
    enabled: enabled && Boolean(customerId),
  });
}

export function useAdjustLoyaltyPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      points,
      reason,
    }: {
      customerId: string;
      points: number;
      reason: string;
    }) => adjustLoyaltyPoints(customerId, points, reason),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: loyaltyKeys.all });
      void qc.invalidateQueries({
        queryKey: loyaltyKeys.detail(variables.customerId),
      });
    },
  });
}

export function useInvalidateLoyalty() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: loyaltyKeys.all });
  };
}

export type { LoyaltyFilters };
