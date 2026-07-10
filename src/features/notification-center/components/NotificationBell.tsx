"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NotificationPanelContent } from "@/features/notification-center/components/NotificationPanelContent";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";
import { ROUTES } from "@/constants/routes";
import type { EnterpriseNotification } from "@/features/notification-center/types";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const initialize = useNotificationStore((state) => state.initialize);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearNotifications = useNotificationStore(
    (state) => state.clearNotifications,
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleNavigate = (notification: EnterpriseNotification) => {
    setOpen(false);
    router.push(notification.href);
  };

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative size-9 text-gray-500", className)}
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
    >
      <Bell className="size-[18px]" />
      {unreadCount > 0 ? (
        <span className="bg-primary absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );

  const handleViewAll = () => {
    setOpen(false);
    router.push(ROUTES.NOTIFICATION_CENTER);
  };

  const panel = (
    <NotificationPanelContent
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClearAll={clearNotifications}
      onNavigate={handleNavigate}
      onViewAll={handleViewAll}
      className={isMobile ? "max-h-[70vh]" : "h-full"}
      listClassName={isMobile ? "max-h-[calc(70vh-9rem)]" : undefined}
    />
  );

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={triggerButton} />
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="w-[min(100vw-2rem,380px)] overflow-hidden rounded-xl p-0 shadow-lg ring-1 ring-gray-100"
        >
          {panel}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={triggerButton} />
      <SheetContent
        side="right"
        showCloseButton
        className="w-full gap-0 border-l border-gray-100 p-0 shadow-2xl sm:max-w-md"
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>
        {panel}
      </SheetContent>
    </Sheet>
  );
}
