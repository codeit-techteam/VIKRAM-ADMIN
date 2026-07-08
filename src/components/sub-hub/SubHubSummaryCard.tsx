"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { SubHubStatusBadge } from "@/components/sub-hub/SubHubStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import type { SubHubSummary } from "@/types/erp.types";
import { formatLastSync } from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface SubHubSummaryCardProps {
  hub: SubHubSummary;
  isLoading?: boolean;
}

export function SubHubSummaryCard({ hub, isLoading }: SubHubSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-28" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <MapPin className="text-primary size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[#1A1A1A]">
                {hub.name}
              </h3>
              <p className="text-sm text-[#64748B]">{hub.city}</p>
            </div>
          </div>
        </div>
        <SubHubStatusBadge status={hub.status} />
      </div>

      <dl className="mt-6 grid flex-1 grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Manager
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#1A1A1A]">
            {hub.managerName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Stock Value
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[#1A1A1A]">
            {hub.stockValueLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Pending Orders
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#1A1A1A]">
            {hub.pendingOrders}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Inventory Health
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[#1A1A1A]">
            {hub.inventoryHealth}%
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Last Inventory Sync
          </dt>
          <dd className="mt-1 text-sm text-[#64748B]">
            {formatLastSync(hub.lastInventorySync)}
          </dd>
        </div>
      </dl>

      <Link
        href={`${ROUTES.SUB_HUB_NETWORK}?hub=${hub.hubId}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-primary mt-6 h-auto w-full justify-between px-0 py-2 hover:bg-transparent hover:underline",
        )}
      >
        View Hub
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
