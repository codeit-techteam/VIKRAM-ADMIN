"use client";

import { useRouter } from "next/navigation";

import { SidebarAccordion } from "@/components/layout/SidebarAccordion";
import { SidebarItem } from "@/components/layout/SidebarItem";
import {
  findActiveChildItem,
  getNavItemChildGroups,
  getNavItemChildren,
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
  /** Exclusive accordion: which parent href is open */
  expandedHref?: string | null;
  onToggleExpand?: (href: string) => void;
}

function isPathActive(pathname: string, href: string): boolean {
  if (!pathname || !href) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavItem({
  item,
  pathname,
  isCollapsed,
  isLogout = false,
  expandedHref = null,
  onToggleExpand,
}: SidebarNavItemProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const childGroups = getNavItemChildGroups(item);
  const children = getNavItemChildren(item);
  const hasChildren = children.length > 0;
  const activeChild = hasChildren
    ? findActiveChildItem(children, pathname)
    : undefined;
  const isExpanded = hasChildren && !isCollapsed && expandedHref === item.href;
  const isLeafActive = !hasChildren && isPathActive(pathname, item.href);

  if (isLogout) {
    return (
      <SidebarItem
        label={item.label}
        icon={item.icon}
        isCollapsed={isCollapsed}
        title={isCollapsed ? item.label : undefined}
        variant="logout"
        onClick={() => {
          logout();
          router.push(ROUTES.LOGIN);
        }}
      />
    );
  }

  if (hasChildren) {
    return (
      <SidebarAccordion
        item={item}
        isExpanded={isExpanded}
        isCollapsed={isCollapsed}
        onToggle={() => onToggleExpand?.(item.href)}
      >
        {childGroups.map((group, groupIndex) => (
          <div
            key={group.label ?? `group-${groupIndex}`}
            className={cn(
              "flex flex-col gap-0.5",
              groupIndex > 0 && "border-t border-gray-100 pt-3",
            )}
          >
            {group.label && !isCollapsed ? (
              <p className="mb-1 px-3 text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                {group.label}
              </p>
            ) : null}

            {group.items.map((child) => {
              const ChildIcon = child.icon;

              return (
                <SidebarItem
                  key={child.href}
                  href={child.href}
                  label={child.label}
                  icon={ChildIcon}
                  badge={child.badge}
                  isActive={activeChild?.href === child.href}
                  variant="child"
                />
              );
            })}
          </div>
        ))}
      </SidebarAccordion>
    );
  }

  return (
    <SidebarItem
      href={item.href}
      label={item.label}
      icon={item.icon}
      isActive={isLeafActive}
      isCollapsed={isCollapsed}
      title={isCollapsed ? item.label : undefined}
    />
  );
}
