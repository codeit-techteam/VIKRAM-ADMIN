"use client";

import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CustomerSummaryCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconContainerClassName?: string;
  iconClassName?: string;
  isLoading?: boolean;
  className?: string;
}

export function CustomerSummaryCard({
  label,
  value,
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  isLoading = false,
  className,
}: CustomerSummaryCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-gray-100 bg-white p-5 shadow-sm",
          className,
        )}
      >
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-12" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hover:border-primary/20 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">{value}</p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              iconContainerClassName,
            )}
          >
            <Icon className={cn("size-4", iconClassName)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
