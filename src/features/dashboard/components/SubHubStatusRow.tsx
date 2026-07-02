import type { SubHubLoadStatus } from "@/features/dashboard/types/dashboard.types";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubHubStatusRowProps {
  name: string;
  loadPercent: number;
  status: SubHubLoadStatus;
}

const statusStyles: Record<SubHubLoadStatus, { dot: string; bar: string }> = {
  healthy: { dot: "bg-green-500", bar: "bg-green-500" },
  warning: { dot: "bg-amber-500", bar: "bg-amber-500" },
  critical: { dot: "bg-red-500", bar: "bg-red-500" },
};

export function SubHubStatusRow({
  name,
  loadPercent,
  status,
}: SubHubStatusRowProps) {
  const styles = statusStyles[status];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn("size-2 shrink-0 rounded-full", styles.dot)}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-[#1A1A1A]">{name}</span>
        </div>
        <span className="text-sm font-semibold text-[#1A1A1A]">
          {loadPercent}% load
        </span>
      </div>
      <Progress value={Math.min(loadPercent, 100)} className="gap-0">
        <ProgressTrack className="h-1.5 bg-gray-100">
          <ProgressIndicator className={styles.bar} />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
