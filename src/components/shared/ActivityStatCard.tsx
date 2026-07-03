import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityStatItem } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

interface ActivityStatRowProps {
  item: ActivityStatItem;
}

const valueVariantClasses = {
  default: "text-[#1A1A1A]",
  warning: "text-primary",
  danger: "text-red-600",
};

const badgeVariantClasses = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-red-100 text-red-700",
};

export function ActivityStatRow({ item }: ActivityStatRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#64748B]">{item.label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-semibold",
            valueVariantClasses[item.valueVariant ?? "default"],
          )}
        >
          {item.value}
        </span>
        {item.badge ? (
          <Badge
            className={cn(
              "rounded px-1.5 py-0 text-[10px] font-semibold uppercase",
              badgeVariantClasses[item.badgeVariant ?? "default"],
            )}
          >
            {item.badge}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

interface ActivityStatCardProps {
  title: string;
  badgeLabel: string;
  items: ActivityStatItem[];
  isLoading?: boolean;
}

export function ActivityStatCard({
  title,
  badgeLabel,
  items,
  isLoading,
}: ActivityStatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
        <Badge className="bg-green-50 text-[10px] font-semibold tracking-wide text-green-700 uppercase hover:bg-green-50">
          {badgeLabel}
        </Badge>
      </div>

      <div className="mt-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : items.map((item) => <ActivityStatRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
