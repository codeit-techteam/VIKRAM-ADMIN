"use client";

import { ArrowRight, Truck } from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import type {
  HubDispatchQueueItem,
  HubDispatchStage,
} from "@/utils/hub-profile-metrics";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface HubDispatchQueueProps {
  items: HubDispatchQueueItem[];
  hubId: string;
}

const STAGE_STYLES: Record<HubDispatchStage, string> = {
  loading: "bg-orange-100 text-orange-700",
  ready: "bg-amber-100 text-amber-700",
  "in-transit": "bg-green-100 text-green-700",
  delivered: "bg-blue-100 text-blue-700",
};

const STAGE_LABELS: Record<HubDispatchStage, string> = {
  loading: "Loading",
  ready: "Ready",
  "in-transit": "In Transit",
  delivered: "Delivered",
};

function formatEta(eta: string): string {
  const date = new Date(eta);
  if (Number.isNaN(date.getTime())) return eta;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HubDispatchQueue({ items, hubId }: HubDispatchQueueProps) {
  return (
    <DashboardCard
      title="Live Dispatch Queue"
      action={
        <Link
          href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch?hub=${hubId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          Open Dispatch Center
          <ArrowRight className="size-3.5" />
        </Link>
      }
      contentClassName="mt-4"
    >
      {items.length === 0 ? (
        <EmptyState
          title="No active dispatches"
          description="Loading, ready, and in-transit transfers for this hub appear here."
          icon={<Truck className="size-8" />}
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex flex-col gap-3 py-4 transition-colors hover:bg-orange-50/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Truck className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="group-hover:text-primary font-semibold text-[#1A1A1A]">
                      {item.transferId}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-[#64748B]">
                      {item.customer}
                      {item.material ? ` · ${item.material}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.vehicle} · {item.driver}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      STAGE_STYLES[item.stage],
                    )}
                  >
                    {STAGE_LABELS[item.stage]}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    ETA {formatEta(item.eta)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
