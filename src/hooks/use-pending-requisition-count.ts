"use client";

import { useEffect, useState } from "react";

import { adminRequisitionsService } from "@/services/adminRequisitions";

let cachedCount: number | null = null;
let inflight: Promise<number> | null = null;

export function invalidatePendingRequisitionCount() {
  cachedCount = null;
}

async function fetchPendingCount(force = false): Promise<number> {
  if (!force && cachedCount !== null) return cachedCount;
  if (!inflight) {
    inflight = adminRequisitionsService
      .stats()
      .then((stats) => {
        cachedCount = stats.pendingRequests ?? stats.pendingApproval ?? 0;
        return cachedCount;
      })
      .catch(() => cachedCount ?? 0)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Live pending requisition badge — refreshes periodically. */
export function usePendingRequisitionCount(
  fallback?: number,
): number | undefined {
  const [count, setCount] = useState<number | undefined>(
    cachedCount ?? fallback,
  );

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void fetchPendingCount(true).then((value) => {
        if (active) setCount(value);
      });
    };
    refresh();
    const id = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return count;
}
