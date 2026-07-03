"use client";

import { Clock } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardNotification } from "@/features/dashboard/types/dashboard.types";

interface NotificationCenterProps {
  notifications: DashboardNotification[];
  isLoading?: boolean;
}

export function NotificationCenter({
  notifications,
  isLoading,
}: NotificationCenterProps) {
  return (
    <DashboardCard
      title="Notification Center"
      titleIcon={<Clock className="text-primary size-4" aria-hidden="true" />}
      contentClassName="mt-4"
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3 px-2 py-3">
              <Skeleton className="size-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Notifications will appear here as operations unfold."
        />
      ) : (
        <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              description={notification.description}
              time={notification.time}
              type={notification.type}
              isUnread={notification.isUnread}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
