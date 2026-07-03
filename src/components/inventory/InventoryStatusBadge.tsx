import type { InventoryStockStatus } from "@/types/inventory.types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  InventoryStockStatus,
  { label: string; container: string; dot: string }
> = {
  "in-stock": {
    label: "In Stock",
    container: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  "low-stock": {
    label: "Low Stock",
    container: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  "out-of-stock": {
    label: "Out of Stock",
    container: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

interface InventoryStatusBadgeProps {
  status: InventoryStockStatus;
  className?: string;
}

export function InventoryStatusBadge({
  status,
  className,
}: InventoryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        config.container,
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", config.dot)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
