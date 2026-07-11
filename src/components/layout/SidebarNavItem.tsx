"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import {
  childMatchesPath,
  findActiveChildItem,
  type NavChildItem,
  type NavItem,
} from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  isLogout?: boolean;
}

function isPathActive(pathname: string, href: string): boolean {
  if (!pathname || !href) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (isPathActive(pathname, item.href)) {
    return true;
  }

  if (item.children?.length) {
    return Boolean(findActiveChildItem(item.children, pathname));
  }

  return false;
}

function SidebarChildLink({
  child,
  isActive,
}: {
  child: NavChildItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={child.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-[#1A1A1A] shadow-md"
          : "text-[#1A1A1A] hover:bg-gray-50",
      )}
    >
      <span className="leading-snug">{child.label}</span>
      <div className="flex shrink-0 items-center gap-2">
        {child.badge ? (
          <span
            className={cn(
              "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
              isActive
                ? "bg-white/80 text-[#1A1A1A]"
                : "bg-red-100 text-[#1A1A1A]",
            )}
          >
            {child.badge}
          </span>
        ) : null}
        {isActive ? (
          <span
            className="size-2 shrink-0 rounded-full bg-[#1A1A1A]"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </Link>
  );
}

export function SidebarNavItem({
  item,
  pathname,
  isCollapsed,
  isLogout = false,
}: SidebarNavItemProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const Icon = item.icon;

  const hasChildren = Boolean(item.children?.length);
  const isParentRouteActive = isPathActive(pathname, item.href);
  const isInSection = isNavItemActive(item, pathname);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Keep the active section expanded when the route changes (e.g. /orders).
  useEffect(() => {
    if (isInSection) {
      setIsManualOpen(true);
    } else {
      setIsManualOpen(false);
    }
  }, [isInSection, pathname]);

  const isExpanded =
    hasChildren && !isCollapsed && (isInSection || isManualOpen);
  const isActive = hasChildren ? false : isParentRouteActive;
  const isSectionActive = hasChildren && isInSection;

  const toggleSubmenu = () => {
    setIsManualOpen((open) => !open);
  };

  const className = cn(
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-white"
      : isSectionActive
        ? "bg-primary/10 text-primary"
        : "text-foreground hover:bg-gray-50",
    isCollapsed && "justify-center px-2",
  );

  const iconClassName = cn(
    "size-[18px] shrink-0",
    isActive
      ? "text-white"
      : isSectionActive
        ? "text-primary"
        : isLogout
          ? "text-red-500"
          : "text-gray-400",
  );

  const iconWrapperClassName = cn(
    hasChildren &&
      !isCollapsed &&
      isSectionActive &&
      "bg-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg",
  );

  const content = (
    <>
      {iconWrapperClassName ? (
        <div className={iconWrapperClassName}>
          <Icon className={iconClassName} />
        </div>
      ) : (
        <Icon className={iconClassName} />
      )}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {hasChildren ? (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                isSectionActive ? "text-primary" : "text-gray-400",
                isExpanded && "rotate-180",
              )}
            />
          ) : (
            item.hasSubmenu && (
              <ChevronRight className="size-4 shrink-0 text-gray-400" />
            )
          )}
        </>
      )}
    </>
  );

  if (isLogout) {
    return (
      <button
        type="button"
        title={isCollapsed ? item.label : undefined}
        className={cn(className, "w-full")}
        onClick={() => {
          logout();
          router.push(ROUTES.LOGIN);
        }}
      >
        {content}
      </button>
    );
  }

  if (hasChildren && !isCollapsed) {
    return (
      <div>
        <button
          type="button"
          title={item.label}
          aria-expanded={isExpanded}
          className={cn(className, "w-full text-left")}
          onClick={toggleSubmenu}
        >
          {content}
        </button>

        {isExpanded && item.children ? (
          <div className="mt-2 flex flex-col gap-1.5 pl-1">
            {item.children.map((child) => (
              <SidebarChildLink
                key={child.href}
                child={child}
                isActive={childMatchesPath(child, pathname)}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}
