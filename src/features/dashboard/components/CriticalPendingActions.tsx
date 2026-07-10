"use client";

import { AlertCircle } from "lucide-react";

import { DashboardKpiCard } from "@/components/shared/DashboardKpiCard";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
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
            <DashboardKpiCard
              key={index}
              title=""
              value={0}
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
            <DashboardKpiCard
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              value={action.count}
              href={action.href}
              icon={action.icon}
              accent={
                action.id === "pending-dispatches" ? "orange" : action.priority
              }
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
