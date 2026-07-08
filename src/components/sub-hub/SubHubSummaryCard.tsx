"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

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
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Manager", value: hub.managerName },
    { label: "Inventory Health", value: `${hub.inventoryHealth}%` },
    { label: "Pending Orders", value: hub.pendingOrders },
    { label: "Pending Requisition", value: hub.pendingRequisitions },
    { label: "Incoming Transfer", value: hub.incomingTransfers },
    { label: "Outgoing Dispatch", value: hub.outgoingTransfers },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-2">
        <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <MapPin className="text-primary size-4" strokeWidth={1.75} />
        </div>
        <h3 className="truncate text-base font-semibold text-[#1A1A1A]">
          {hub.name}
        </h3>
      </div>

      <dl className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-xs font-medium text-[#64748B]">
              {metric.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-[#1A1A1A]">
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
