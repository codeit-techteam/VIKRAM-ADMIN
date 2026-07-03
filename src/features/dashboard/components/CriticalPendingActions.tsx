"use client";

import { AlertCircle } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriorityActionCard } from "@/components/shared/PriorityActionCard";
import type { PendingAction } from "@/features/dashboard/types/dashboard.types";

interface CriticalPendingActionsProps {
  actions: PendingAction[];
  isLoading?: boolean;
}

export function CriticalPendingActions({
  actions,
  isLoading,
}: CriticalPendingActionsProps) {
  return (
    <DashboardCard
      title="Critical Pending Actions"
      titleIcon={
        <AlertCircle className="text-primary size-4" aria-hidden="true" />
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <PriorityActionCard
              key={index}
              title=""
              count={0}
              priority="high"
              href="#"
              isLoading
            />
          ))}
        </div>
      ) : actions.length === 0 ? (
        <EmptyState
          title="No pending actions"
          description="All operational tasks are up to date."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action) => (
            <PriorityActionCard
              key={action.id}
              title={action.title}
              count={action.count}
              priority={action.priority}
              href={action.href}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
