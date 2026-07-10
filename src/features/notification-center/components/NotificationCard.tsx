"use client";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
} from "@/features/notification-center/constants";
import type { EnterpriseNotification } from "@/features/notification-center/types";
import { formatNotificationTime } from "@/features/notification-center/utils/format-notification-time";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: EnterpriseNotification;
  variant?: "compact" | "full";
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onClick?: (notification: EnterpriseNotification) => void;
  onAction?: (notification: EnterpriseNotification) => void;
  showActionButton?: boolean;
  className?: string;
}

export function NotificationCard({
  notification,
  variant = "compact",
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  onAction,
  showActionButton = true,
  className,
}: NotificationCardProps) {
  const category = CATEGORY_CONFIG[notification.category];
  const priority = PRIORITY_CONFIG[notification.priority];
  const CategoryIcon = category.icon;
  const isCompact = variant === "compact";

  const handleCardClick = () => {
    onClick?.(notification);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAction?.(notification);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group flex w-full cursor-pointer gap-3 rounded-xl border border-transparent p-3 text-left transition-all duration-200",
        notification.isRead
          ? "bg-white hover:border-gray-100 hover:bg-gray-50/80"
          : "border-orange-100/80 bg-orange-50/50 shadow-sm hover:border-orange-100 hover:bg-orange-50/70",
        isCompact ? "items-start" : "items-start p-4",
        className,
      )}
    >
      {selectable ? (
        <div
          className="pt-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) =>
              onSelect?.(notification.id, checked === true)
            }
            aria-label={`Select ${notification.title}`}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          isCompact ? "size-9" : "size-10",
          category.badgeClass,
        )}
      >
        <CategoryIcon className={cn(isCompact ? "size-4" : "size-[18px]")} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "rounded-md px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase",
              category.badgeClass,
            )}
          >
            {category.label}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-md px-1.5 py-0 text-[10px] font-medium",
              priority.className,
            )}
          >
            {priority.label}
          </Badge>
          {!notification.isRead ? (
            <span className="bg-primary size-1.5 rounded-full" aria-hidden />
          ) : null}
        </div>

        <p
          className={cn(
            "mt-1.5 font-semibold text-[#1A1A1A]",
            isCompact ? "text-sm" : "text-base",
          )}
        >
          {notification.title}
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 leading-relaxed text-[#64748B]",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {notification.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400">
            {formatNotificationTime(notification.createdAt)}
          </span>
          {showActionButton ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary h-7 px-2 text-xs font-semibold"
              onClick={handleActionClick}
            >
              {notification.actionLabel}
              <ArrowRight className="size-3" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
