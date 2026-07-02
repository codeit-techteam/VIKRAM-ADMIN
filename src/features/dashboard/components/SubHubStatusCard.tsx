import type { SubHubStatus } from "@/features/dashboard/types/dashboard.types";
import { SubHubStatusRow } from "@/features/dashboard/components/SubHubStatusRow";

interface SubHubStatusCardProps {
  hubs: SubHubStatus[];
}

export function SubHubStatusCard({ hubs }: SubHubStatusCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Sub-Hub Status
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Real-time operational load
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {hubs.map((hub) => (
          <SubHubStatusRow
            key={hub.id}
            name={hub.name}
            loadPercent={hub.loadPercent}
            status={hub.status}
          />
        ))}
      </div>
    </div>
  );
}
