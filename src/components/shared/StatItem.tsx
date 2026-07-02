import { cn } from "@/lib/utils";

interface StatItemProps {
  value: string;
  label: string;
  showDivider?: boolean;
  className?: string;
}

export function StatItem({
  value,
  label,
  showDivider = false,
  className,
}: StatItemProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-0.5",
        showDivider && "border-l border-white/20 pl-6",
        className,
      )}
    >
      <span className="text-2xl font-bold tracking-tight text-white">
        {value}
      </span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}
