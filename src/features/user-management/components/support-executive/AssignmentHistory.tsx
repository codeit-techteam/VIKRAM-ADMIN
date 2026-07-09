"use client";

import { Badge } from "@/components/ui/badge";
import {
  SUPPORT_ASSIGNMENT_REASON_LABELS,
  type SupportExecutiveAssignmentHistoryEntry,
} from "@/features/user-management/types/support-executive.types";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface AssignmentHistoryProps {
  history: SupportExecutiveAssignmentHistoryEntry[];
  className?: string;
}

export function AssignmentHistory({
  history,
  className,
}: AssignmentHistoryProps) {
  if (history.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-[#64748B]">
          No assignment history yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {history.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg border border-gray-100 bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {entry.executiveName}
              </p>
              <p className="text-xs text-[#64748B]">{entry.employeeId}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                entry.status === "CURRENT"
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-gray-200 bg-gray-50 text-[#64748B]",
              )}
            >
              {entry.status === "CURRENT" ? "Current" : "Previous"}
            </Badge>
          </div>

          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Assigned By
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {entry.assignedBy}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Reason
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {SUPPORT_ASSIGNMENT_REASON_LABELS[entry.reason]}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Assigned Date
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {formatDate(entry.assignedDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Removed Date
              </p>
              <p className="mt-0.5 font-medium text-[#1A1A1A]">
                {entry.removedDate ? formatDate(entry.removedDate) : "—"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
