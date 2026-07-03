import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-3 text-gray-400">{icon}</div> : null}
      <p className="text-sm font-medium text-[#1A1A1A]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-[#64748B]">{description}</p>
      ) : null}
    </div>
  );
}
