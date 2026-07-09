import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  loading: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-blue-100 text-blue-700",
  in_transit: "bg-sky-100 text-sky-700",
  reached_hub: "bg-teal-100 text-teal-700",
  completed: "bg-emerald-100 text-emerald-700",
  delayed: "bg-red-100 text-red-700",
  packed: "bg-slate-100 text-slate-600",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  returned: "bg-purple-100 text-purple-700",
  available: "bg-emerald-100 text-emerald-700",
  running: "bg-sky-100 text-sky-700",
  maintenance: "bg-amber-100 text-amber-700",
  inactive: "bg-gray-100 text-gray-500",
  driving: "bg-blue-100 text-blue-700",
  on_leave: "bg-purple-100 text-purple-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_maintenance: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  loading: "Loading",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  reached_hub: "Reached Hub",
  completed: "Completed",
  delayed: "Delayed",
  packed: "Packed",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
  returned: "Returned",
  available: "Available",
  running: "Running",
  maintenance: "Maintenance",
  inactive: "Inactive",
  driving: "Driving",
  on_leave: "On Leave",
  scheduled: "Scheduled",
  in_maintenance: "In Maintenance",
  overdue: "Overdue",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

interface LogisticsStatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function LogisticsStatusBadge({
  status,
  label,
  className,
}: LogisticsStatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  const style = STATUS_STYLES[normalized] ?? "bg-slate-100 text-slate-600";
  const displayLabel = label ?? STATUS_LABELS[normalized] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
