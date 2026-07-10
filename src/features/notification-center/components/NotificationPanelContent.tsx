"use client";

import { CheckCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationCard } from "@/features/notification-center/components/NotificationCard";
import { NOTIFICATION_DRAWER_FILTER_OPTIONS } from "@/features/notification-center/constants";
import { filterDrawerNotifications } from "@/features/notification-center/mock/queries";
import type {
  EnterpriseNotification,
  NotificationFilterValue,
} from "@/features/notification-center/types";
import { cn } from "@/lib/utils";

interface NotificationPanelContentProps {
  notifications: EnterpriseNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigate: (notification: EnterpriseNotification) => void;
  onViewAll?: () => void;
  className?: string;
  listClassName?: string;
}

export function NotificationPanelContent({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigate,
  onViewAll,
  className,
  listClassName,
}: NotificationPanelContentProps) {
  const [filter, setFilter] = useState<NotificationFilterValue>("all");

  const filteredNotifications = useMemo(
    () => filterDrawerNotifications(notifications, filter),
    [notifications, filter],
  );

  const handleNotificationClick = (notification: EnterpriseNotification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNavigate(notification);
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A]">
              Notifications
            </h2>
            {unreadCount > 0 ? (
              <p className="mt-0.5 text-xs text-[#64748B]">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-[#64748B]">All caught up</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#64748B]"
              disabled={unreadCount === 0}
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#64748B]"
              disabled={notifications.length === 0}
              onClick={onClearAll}
            >
              <Trash2 className="size-3.5" />
              Clear all
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <Select
            value={filter}
            onValueChange={(value) =>
              setFilter(value as NotificationFilterValue)
            }
          >
            <SelectTrigger className="h-9 w-full border-gray-200 bg-gray-50/50 text-sm">
              <SelectValue placeholder="Filter notifications" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_DRAWER_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto px-3 py-3", listClassName)}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm font-medium text-[#1A1A1A]">
              No notifications
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              {filter === "unread"
                ? "You have no unread notifications."
                : "Nothing to show for this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                variant="compact"
                onClick={handleNotificationClick}
                onAction={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <Button
          variant="outline"
          className="w-full border-gray-200 text-sm font-semibold text-[#1A1A1A]"
          onClick={onViewAll}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
}
