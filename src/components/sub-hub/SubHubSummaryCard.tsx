"use client";

import { ArrowRight, MapPin, User } from "lucide-react";
import Link from "next/link";

import { InventoryHealthBar } from "@/components/sub-hub/InventoryHealthBar";
import { SubHubStatusBadge } from "@/components/sub-hub/SubHubStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubHubSummary } from "@/types/erp.types";
import { getHubDetailPath } from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface SubHubSummaryCardProps {
  hub: SubHubSummary;
  isLoading?: boolean;
}

export function SubHubSummaryCard({ hub, isLoading }: SubHubSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-28" />
        <Skeleton className="mt-5 h-2 w-full rounded-full" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const opsMetrics = [
    { label: "Pending Orders", value: hub.pendingOrders },
    { label: "Requisitions", value: hub.pendingRequisitions },
    { label: "Incoming", value: hub.incomingTransfers },
    { label: "Outgoing", value: hub.outgoingTransfers },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md",
        hub.status === "critical"
          ? "border-red-100"
          : hub.status === "warning"
            ? "border-orange-100"
            : "border-gray-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <MapPin className="text-primary size-4" strokeWidth={1.75} />
            </div>
            <h3 className="truncate text-base font-semibold text-[#1A1A1A]">
              {hub.name}
            </h3>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 pl-10 text-xs text-[#64748B]">
            <User className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {hub.managerName}
              {hub.city ? ` · ${hub.city}` : null}
            </span>
          </p>
        </div>
        <SubHubStatusBadge status={hub.status} className="shrink-0" />
      </div>

      <div className="mt-4 rounded-lg bg-gray-50/80 px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#64748B]">
            Inventory Health
          </span>
          <span className="text-xs font-medium text-[#64748B]">
            Stock {hub.stockValueLabel}
          </span>
        </div>
        <InventoryHealthBar health={hub.inventoryHealth} />
      </div>

      <dl className="mt-4 grid flex-1 grid-cols-2 gap-2">
        {opsMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-100 bg-white px-3 py-2.5"
          >
            <dt className="text-[11px] font-medium tracking-wide text-[#64748B] uppercase">
              {metric.label}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[#1A1A1A] tabular-nums">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={getHubDetailPath(hub.hubId)}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-primary mt-4 h-auto w-full justify-between px-0 py-1.5 hover:bg-transparent hover:underline",
        )}
      >
        View Hub
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
