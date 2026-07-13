"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  IndianRupee,
  Lock,
  Package,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type HubInventoryStatKey =
  "total-inventory" | "low-stock" | "inventory-value" | "reserved-inventory";

export interface HubInventoryStatCardData {
  id: HubInventoryStatKey;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "warning" | "danger";
}

const iconMap: Record<HubInventoryStatKey, LucideIcon> = {
  "total-inventory": Package,
  "low-stock": AlertTriangle,
  "inventory-value": IndianRupee,
  "reserved-inventory": Lock,
};

interface HubInventoryStatsCardProps {
  stat: HubInventoryStatCardData;
  isLoading?: boolean;
  index?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function HubInventoryStatsCard({
  stat,
  isLoading,
  index = 0,
  isActive = false,
  onClick,
}: HubInventoryStatsCardProps) {
  const Icon = iconMap[stat.id];
  const isWarning = stat.variant === "warning";
  const isDanger = stat.variant === "danger";

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      className={cn(
        "h-full rounded-xl border p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md",
        isActive
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-gray-100",
        isDanger ? "bg-red-50/50" : isWarning ? "bg-orange-50/60" : "bg-white",
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
      <button
        type="button"
        onClick={onClick}
        className="h-full w-full text-left"
      >
        {content}
      </button>
    );
  }

  return content;
}
