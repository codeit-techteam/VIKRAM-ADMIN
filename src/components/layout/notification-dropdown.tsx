"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notification-store";
import { formatRelativeDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative size-9">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !notification.isRead && "text-primary",
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatRelativeDate(notification.createdAt)}
                  </span>
                </div>
                <span className="text-muted-foreground line-clamp-2 text-xs">
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
