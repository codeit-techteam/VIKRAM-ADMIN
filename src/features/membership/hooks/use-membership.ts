"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelMembership,
  getMembershipById,
  getMemberships,
  getMembershipStats,
  renewMembership,
  type MembershipQueryParams,
} from "@/features/membership/services/membership.service";

export const membershipKeys = {
  all: ["admin-memberships"] as const,
  stats: () => [...membershipKeys.all, "stats"] as const,
  list: (params: MembershipQueryParams) =>
    [...membershipKeys.all, "list", params] as const,
  detail: (id: string) => [...membershipKeys.all, "detail", id] as const,
};

const REFETCH_MS = 30_000;

export function useMembershipStats() {
  return useQuery({
    queryKey: membershipKeys.stats(),
    queryFn: getMembershipStats,
    refetchInterval: REFETCH_MS,
  });
}

export function useMemberships(params: MembershipQueryParams) {
  return useQuery({
    queryKey: membershipKeys.list(params),
    queryFn: () => getMemberships(params),
    placeholderData: (prev) => prev,
    refetchInterval: REFETCH_MS,
  });
}

export function useMembershipDetail(id: string | null, enabled = true) {
  return useQuery({
    queryKey: membershipKeys.detail(id ?? ""),
    queryFn: () => getMembershipById(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useRenewMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renewMembership(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

export function useCancelMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelMembership(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}
