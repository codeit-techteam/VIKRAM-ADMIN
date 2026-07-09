"use client";

import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  executiveName: string;
  hubName: string;
  activeCustomers: number;
  className?: string;
}

export function ExecutiveSummary({
  executiveName,
  hubName,
  activeCustomers,
  className,
}: ExecutiveSummaryProps) {
  return (
    <div
      className={cn(
        "border-primary/20 bg-primary/5 rounded-lg border p-4",
        className,
      )}
    >
      <p className="text-primary text-[10px] font-semibold tracking-wider uppercase">
        Selected Executive
      </p>
      <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
        {executiveName}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Hub
          </p>
          <p className="mt-0.5 font-medium text-[#1A1A1A]">{hubName}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Assigned Customers
          </p>
          <p className="mt-0.5 font-medium text-[#1A1A1A]">{activeCustomers}</p>
        </div>
      </div>
    </div>
  );
}
