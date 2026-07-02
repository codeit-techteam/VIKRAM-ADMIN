import { cn } from "@/lib/utils";

interface StockLevelBarProps {
  units: number;
  maxCapacity?: number;
  unitLabel?: string;
  className?: string;
}

function getBarColor(percentage: number, units: number): string {
  if (units === 0) return "bg-gray-200";
  if (percentage > 20) return "bg-green-500";
  return "bg-red-500";
}

export function StockLevelBar({
  units,
  maxCapacity = 1500,
  unitLabel = "Units",
  className,
}: StockLevelBarProps) {
  const percentage =
    units === 0 ? 0 : Math.min((units / maxCapacity) * 100, 100);
  const formattedUnits = new Intl.NumberFormat("en-IN").format(units);

  return (
    <div className={cn("min-w-[120px]", className)}>
      <p className="text-sm font-medium text-[#1A1A1A]">
        {formattedUnits} {unitLabel}
      </p>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            getBarColor(percentage, units),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
