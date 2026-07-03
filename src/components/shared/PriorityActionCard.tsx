import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActionPriority } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

interface PriorityActionCardProps {
  title: string;
  count: number;
  priority: ActionPriority;
  href: string;
  isLoading?: boolean;
}

const priorityBorderClasses: Record<ActionPriority, string> = {
  high: "border-l-red-500",
  medium: "border-l-primary",
};

export function PriorityActionCard({
  title,
  count,
  priority,
  href,
  isLoading,
}: PriorityActionCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-l-4 border-gray-100 border-l-gray-200 bg-white p-5 shadow-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-8 w-12" />
        <Skeleton className="mt-4 h-9 w-16 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 border-gray-100 bg-white p-5 shadow-sm",
        priorityBorderClasses[priority],
      )}
    >
      <p className="text-sm font-medium text-[#64748B]">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#1A1A1A]">
        {String(count).padStart(2, "0")}
      </p>
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-4 h-8 border-gray-200 px-4 text-xs font-medium text-[#1A1A1A] hover:bg-gray-50",
        )}
      >
        View
      </Link>
    </div>
  );
}
