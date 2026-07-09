"use client";

import { Badge } from "@/components/ui/badge";
import {
  EXECUTIVE_STATUS_LABELS,
  type ExecutiveAvailabilityStatus,
  type SupportExecutive,
} from "@/features/user-management/types/support-executive.types";
import { cn } from "@/lib/utils";

interface ExecutiveCardProps {
  executive: SupportExecutive;
  selected?: boolean;
  onSelect: (executiveId: string) => void;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
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

function getStatusStyles(status: ExecutiveAvailabilityStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "BUSY":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "OFFLINE":
      return "border-gray-200 bg-gray-50 text-gray-600";
    case "LEAVE":
      return "border-red-200 bg-red-50 text-red-600";
  }
}

export function ExecutiveCard({
  executive,
  selected = false,
  onSelect,
}: ExecutiveCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(executive.id)}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 ring-primary/20 shadow-sm ring-1"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            getAvatarColor(executive.id),
          )}
        >
          {getInitials(executive.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[#1A1A1A]">{executive.name}</p>
              <p className="text-xs text-[#64748B]">{executive.employeeId}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                getStatusStyles(executive.status),
              )}
            >
              {EXECUTIVE_STATUS_LABELS[executive.status]}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Hub
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {executive.hubName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Active Customers
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {executive.activeCustomers}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Open Tickets
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {executive.openTickets}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
