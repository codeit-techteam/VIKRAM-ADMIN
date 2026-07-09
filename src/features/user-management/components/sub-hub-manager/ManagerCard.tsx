"use client";

import {
  ArrowRightLeft,
  Eye,
  MapPin,
  Package,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ManagerStatusBadge } from "@/features/user-management/components/sub-hub-manager/ManagerStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { SubHubManager } from "@/features/user-management/types/sub-hub-manager.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

interface OperationalStatProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function OperationalStat({ label, value, highlight }: OperationalStatProps) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "text-sm font-bold",
          highlight ? "text-amber-600" : "text-[#1A1A1A]",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] text-[#64748B]">{label}</span>
    </div>
  );
}

interface ManagerCardProps {
  manager: SubHubManager;
  onTransfer?: (manager: SubHubManager) => void;
}

export function ManagerCard({ manager, onTransfer }: ManagerCardProps) {
  const isAttention =
    manager.pendingRequisitions > 5 ||
    manager.lowStockItems > 10 ||
    manager.pendingDispatches > 15;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        isAttention ? "border-amber-200" : "border-gray-100",
      )}
    >
      {isAttention && (
        <span className="absolute top-3 right-3 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            getAvatarColor(manager.id),
          )}
        >
          {manager.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={manager.photo}
              alt={manager.name}
              className="size-full rounded-xl object-cover"
            />
          ) : (
            getInitials(manager.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#1A1A1A]">
            {manager.name}
          </p>
          <p className="text-xs text-[#64748B]">{manager.employeeId}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{manager.hubName}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">{manager.city}</p>
        </div>
        <ManagerStatusBadge status={manager.status} />
      </div>

      {/* Operational summary */}
      <div className="mt-4 rounded-lg bg-[#FAFAF8] p-3">
        <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Operational Summary
        </p>
        <div className="grid grid-cols-3 gap-3">
          <OperationalStat
            label="Pending Req."
            value={manager.pendingRequisitions}
            highlight={manager.pendingRequisitions > 5}
          />
          <OperationalStat
            label="Pending Disp."
            value={manager.pendingDispatches}
            highlight={manager.pendingDispatches > 15}
          />
          <OperationalStat label="Today's Orders" value={manager.todayOrders} />
          <OperationalStat
            label="Low Stock"
            value={manager.lowStockItems}
            highlight={manager.lowStockItems > 10}
          />
          <div className="col-span-2 flex flex-col">
            <span className="text-sm font-bold text-[#1A1A1A]">
              {manager.availableDrivers} / {manager.totalDrivers}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
              <Users className="size-3" />
              Drivers
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`${ROUTES.SUB_HUB_MANAGERS}/${manager.id}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "flex-1 gap-1.5",
          })}
        >
          <Eye className="size-3.5" />
          View Manager
        </Link>
        <Link
          href={`${ROUTES.SUB_HUB_NETWORK}/${manager.hubId}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "gap-1.5",
          })}
        >
          <Package className="size-3.5" />
          Hub
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onTransfer?.(manager)}
          aria-label="Transfer hub"
        >
          <ArrowRightLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ManagerCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 rounded-lg bg-gray-100 p-3">
        <div className="mb-2 h-3 w-28 rounded bg-gray-200" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 w-8 rounded bg-gray-200" />
              <div className="h-3 w-14 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 flex-1 rounded bg-gray-200" />
        <div className="h-8 w-16 rounded bg-gray-200" />
        <div className="h-8 w-10 rounded bg-gray-200" />
      </div>
    </div>
  );
}
