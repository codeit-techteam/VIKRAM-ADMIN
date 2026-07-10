"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  XCircle,
  PackageCheck,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { HubRequisitionStats } from "@/mock/hub-requisitions";
import { cn } from "@/lib/utils";

export type HubRequisitionStatKey =
  "pending" | "approved" | "rejected" | "completed";

export interface HubRequisitionStatCardData {
  id: HubRequisitionStatKey;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

const iconMap: Record<HubRequisitionStatKey, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  completed: PackageCheck,
};

interface HubRequisitionStatsCardProps {
  stat: HubRequisitionStatCardData;
  isLoading?: boolean;
  index?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function HubRequisitionStatsCard({
  stat,
  isLoading,
  index = 0,
  isActive = false,
  onClick,
}: HubRequisitionStatsCardProps) {
  const Icon = iconMap[stat.id];
  const isWarning = stat.variant === "warning";
  const isDanger = stat.variant === "danger";
  const isSuccess = stat.variant === "success";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
    );
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      className={cn(
        "rounded-xl border p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md",
        isActive
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-gray-100",
        isDanger
          ? "bg-red-50/50"
          : isWarning
            ? "bg-orange-50/60"
            : isSuccess
              ? "bg-emerald-50/50"
              : "bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight",
              isDanger
                ? "text-red-600"
                : isWarning
                  ? "text-primary"
                  : isSuccess
                    ? "text-emerald-700"
                    : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
          {stat.subtitle ? (
            <p className="mt-1 text-sm text-[#64748B]">{stat.subtitle}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isDanger
              ? "bg-red-100 text-red-600"
              : isWarning
                ? "bg-primary/15 text-primary"
                : isSuccess
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

export function buildHubRequisitionStatCards(
  stats: HubRequisitionStats,
): HubRequisitionStatCardData[] {
  return [
    {
      id: "pending",
      label: "Pending",
      value: String(stats.pending).padStart(2, "0"),
      subtitle: "Awaiting approval",
      variant: stats.pending > 0 ? "warning" : "default",
    },
    {
      id: "approved",
      label: "Approved",
      value: String(stats.approved).padStart(2, "0"),
      subtitle: "Ready for allocation",
      variant: "success",
    },
    {
      id: "rejected",
      label: "Rejected",
      value: String(stats.rejected).padStart(2, "0"),
      subtitle: "Declined requests",
      variant: stats.rejected > 0 ? "danger" : "default",
    },
    {
      id: "completed",
      label: "Completed",
      value: String(stats.completed).padStart(2, "0"),
      subtitle: "Transferred or fulfilled",
      variant: "default",
    },
  ];
}
