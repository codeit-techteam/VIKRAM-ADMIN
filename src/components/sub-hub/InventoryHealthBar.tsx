import {
  getInventoryHealthBarColor,
  getInventoryHealthColor,
} from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface InventoryHealthBarProps {
  health: number;
  showLabel?: boolean;
  className?: string;
}

export function InventoryHealthBar({
  health,
  showLabel = true,
  className,
}: InventoryHealthBarProps) {
  const clampedHealth = Math.min(health, 100);

  return (
    <div className={cn("flex min-w-[120px] items-center gap-3", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            getInventoryHealthBarColor(health),
          )}
          style={{ width: `${clampedHealth}%` }}
        />
      </div>
      {showLabel ? (
        <span
          className={cn(
            "w-10 text-right text-sm font-semibold",
            getInventoryHealthColor(health),
          )}
        >
          {health}%
        </span>
      ) : null}
    </div>
  );
}
