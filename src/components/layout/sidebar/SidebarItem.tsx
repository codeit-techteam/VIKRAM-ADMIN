"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { SidebarBadge } from "@/components/layout/sidebar/SidebarBadge";
import type { NavChildItem, NavItem } from "@/constants/navigation.constants";
import { isPathActive } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  item: NavItem | NavChildItem;
  pathname: string;
  isCollapsed: boolean;
  isChild?: boolean;
  isLogout?: boolean;
  showFavoriteToggle?: boolean;
  onNavigate?: () => void;
}

function SidebarItemContent({
  item,
  isActive,
  isCollapsed,
  isChild,
  isLogout,
  showFavoriteToggle,
}: {
  item: NavItem | NavChildItem;
  isActive: boolean;
  isCollapsed: boolean;
  isChild?: boolean;
  isLogout?: boolean;
  showFavoriteToggle?: boolean;
}) {
  const Icon = item.icon;
  const toggleFavorite = useSidebarStore((state) => state.toggleFavorite);
  const isFavorite = useSidebarStore((state) => state.isFavorite);
  const favorited = isFavorite(item.href);

  return (
    <>
      {Icon ? (
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-colors duration-120",
            isActive
              ? "text-primary"
              : isLogout
                ? "text-red-500"
                : "group-hover:text-primary text-gray-400",
          )}
          aria-hidden="true"
        />
      ) : null}

      {!isCollapsed && (
        <>
          <span
            className={cn(
              "flex-1 truncate",
              isActive && "text-primary font-semibold",
            )}
          >
            {item.label}
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            {"badge" in item && item.badge ? (
              <SidebarBadge badge={item.badge} />
            ) : null}

            {showFavoriteToggle && !isLogout ? (
              <button
                type="button"
                aria-label={
                  favorited ? `Unpin ${item.label}` : `Pin ${item.label}`
                }
                className={cn(
                  "hover:text-primary focus-visible:ring-primary/30 rounded p-0.5 text-gray-300 transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  favorited && "text-primary opacity-100",
                  !favorited && "opacity-0 group-hover:opacity-100",
                )}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFavorite(item.href);
                }}
              >
                <Star className={cn("size-3.5", favorited && "fill-primary")} />
              </button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

export function SidebarItem({
  item,
  pathname,
  isCollapsed,
  isChild = false,
  isLogout = false,
  showFavoriteToggle = false,
  onNavigate,
}: SidebarItemProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const isActive = isPathActive(pathname, item.href);

  const className = cn(
    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-120",
    "hover:cursor-pointer hover:bg-primary/10 hover:text-primary",
    "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none",
    isActive &&
      "border-l-4 border-primary bg-primary/10 pl-2.5 font-semibold text-primary",
    isChild && "py-2 text-[13px]",
    isCollapsed && "justify-center px-2",
    isLogout && "text-red-600 hover:bg-red-50 hover:text-red-600",
  );

  const inner = (
    <SidebarItemContent
      item={item}
      isActive={isActive}
      isCollapsed={isCollapsed}
      isChild={isChild}
      isLogout={isLogout}
      showFavoriteToggle={showFavoriteToggle}
    />
  );

  if (isLogout) {
    const button = (
      <button
        type="button"
        aria-label="Logout"
        className={className}
        onClick={() => {
          logout();
          onNavigate?.();
          router.push(ROUTES.LOGIN);
        }}
      >
        {inner}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger render={button} />
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      className={className}
      onClick={onNavigate}
    >
      {inner}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
