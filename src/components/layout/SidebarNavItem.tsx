"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import {
  findActiveChildItem,
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
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
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
  const activeChild = hasChildren
    ? findActiveChildItem(item.children!, pathname)
    : undefined;
  const isChildActive = Boolean(activeChild);
  const isParentRouteActive = isPathActive(pathname, item.href);
  const isInSection = isParentRouteActive || isChildActive;
  const [isManualOpen, setIsManualOpen] = useState(false);

  useEffect(() => {
    if (!isInSection) {
      setIsManualOpen(false);
    }
  }, [isInSection]);

  const isExpanded =
    hasChildren && !isCollapsed && (isInSection || isManualOpen);
  const isActive = hasChildren ? false : isParentRouteActive;
  const isSectionActive = hasChildren && isChildActive;

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

  const content = (
    <>
      <Icon className={iconClassName} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {hasChildren ? (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
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
          <div className="border-primary/20 mt-0.5 ml-4 flex flex-col gap-0.5 border-l-2 pl-1">
            {item.children.map((child) => {
              const childIsActive = activeChild?.href === child.href;

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  aria-current={childIsActive ? "page" : undefined}
                  className={cn(
                    "rounded-lg py-2 pr-3 pl-5 text-sm font-medium transition-colors",
                    childIsActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
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
