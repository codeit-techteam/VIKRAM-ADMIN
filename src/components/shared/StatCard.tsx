import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  valueVariant?: "default" | "warning";
  icon?: LucideIcon;
  iconContainerClassName?: string;
  iconClassName?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  valueVariant = "default",
  icon: Icon,
  iconContainerClassName,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold",
              valueVariant === "warning" ? "text-primary" : "text-[#1A1A1A]",
            )}
          >
            {value}
          </p>
          {subtext ? (
            <p className="mt-1 text-sm text-[#64748B]">{subtext}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconContainerClassName,
            )}
          >
            <Icon className={cn("size-5", iconClassName)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
