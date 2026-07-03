import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  titleIcon?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  titleIcon,
  action,
  badge,
  children,
  className,
  contentClassName,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {(title || action || badge) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {titleIcon}
            {title ? (
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                {title}
              </h2>
            ) : null}
            {badge}
          </div>
          {action}
        </div>
      )}
      <div
        className={cn(title || action || badge ? "mt-6" : "", contentClassName)}
      >
        {children}
      </div>
    </div>
  );
}
