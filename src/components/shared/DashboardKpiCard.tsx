import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import type { ActionPriority } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type DashboardKpiAccent = ActionPriority | "orange";

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  href: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: DashboardKpiAccent;
  isLoading?: boolean;
  className?: string;
}

const accentBorderClasses: Record<DashboardKpiAccent, string> = {
  high: "border-l-red-500",
  medium: "border-l-primary",
  orange: "border-l-primary",
};

const iconContainerClasses: Record<DashboardKpiAccent, string> = {
  high: "bg-red-50",
  medium: "bg-orange-50",
  orange: "bg-orange-50",
};

const iconClasses: Record<DashboardKpiAccent, string> = {
  high: "text-red-500",
  medium: "text-primary",
  orange: "text-primary",
};

function formatKpiValue(value: string | number): string {
  if (typeof value === "number") {
    return String(value).padStart(2, "0");
  }
  return value;
}

export function DashboardKpiCard({
  title,
  value,
  href,
  subtitle,
  icon: Icon,
  accent = "medium",
  isLoading,
  className,
}: DashboardKpiCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-l-4 border-gray-100 border-l-gray-200 bg-white p-5 shadow-sm",
          className,
        )}
      >
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-8 w-12" />
        <Skeleton className="mt-2 h-3 w-52" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-xl border border-l-4 border-gray-100 bg-white p-5 shadow-sm",
        "cursor-pointer transition-all duration-200",
        "hover:border-primary hover:-translate-y-0.5 hover:shadow-md",
        accentBorderClasses[accent],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A1A]">
            {formatKpiValue(value)}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-[#94A3B8]">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconContainerClasses[accent],
            )}
          >
            <Icon className={cn("size-5", iconClasses[accent])} />
          </div>
        ) : null}
      </div>
      <span className="group-hover:border-primary mt-4 inline-flex h-8 items-center rounded-md border border-gray-200 px-4 text-xs font-medium text-[#1A1A1A] transition-colors group-hover:bg-orange-50">
        View
      </span>
    </Link>
  );
}
