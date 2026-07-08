"use client";

import { MapPin, Plus, Warehouse } from "lucide-react";
import Link from "next/link";

import { SubHubStatusBadge } from "@/components/sub-hub/SubHubStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import type { SubHub, SubHubOperationalStatus } from "@/types/erp.types";
import {
  getHubInventoryHref,
  getRaiseTransferHref,
} from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubProfileHeaderProps {
  hub: SubHub;
  status: SubHubOperationalStatus;
  className?: string;
}

export function HubProfileHeader({
  hub,
  status,
  className,
}: HubProfileHeaderProps) {
  const location = hub.address ?? `${hub.city}, ${hub.region}`;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 -mx-1 border-b border-gray-100 bg-white/95 px-1 py-4 backdrop-blur supports-backdrop-filter:bg-white/80",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
              {hub.name} Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold tracking-wide text-green-700 uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
              {hub.isActive ? "Operational · Live" : "Inactive"}
            </span>
            <SubHubStatusBadge status={status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {location}
            </span>
            <span className="font-medium text-[#1A1A1A]">
              Code: {hub.nodeId}
            </span>
            <span>
              Manager:{" "}
              <span className="font-medium text-[#1A1A1A]">
                {hub.managerName}
              </span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={getHubInventoryHref(hub.id)}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "gap-2",
            )}
          >
            <Warehouse className="size-4" />
            View Inventory
          </Link>
          <Link
            href={getRaiseTransferHref(hub.id)}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "gap-2",
            )}
          >
            <Plus className="size-4" />
            Raise Transfer
          </Link>
        </div>
      </div>
    </header>
  );
}
