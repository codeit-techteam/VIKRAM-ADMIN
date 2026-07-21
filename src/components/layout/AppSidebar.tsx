"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import {
  BOTTOM_NAV_ITEMS,
  findActiveNavParent,
  NAV_SECTIONS,
  type NavItem,
  type NavSection,
} from "@/constants/navigation.constants";
import {
  NAV_ITEM_PERMISSIONS,
  getDefaultRouteForRole,
} from "@/constants/route-access";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

function filterNavItem(
  item: NavItem,
  can: (permission: string) => boolean,
): NavItem | null {
  const required = NAV_ITEM_PERMISSIONS[item.href];
  if (required && !can(required)) return null;
  return item;
}

function filterNavSections(
  sections: NavSection[],
  can: (permission: string) => boolean,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => filterNavItem(item, can))
        .filter((item): item is NavItem => item !== null),
    }))
    .filter((section) => section.items.length > 0);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const { role } = useAuth();
  const homeHref = role ? getDefaultRouteForRole(role) : "/dashboard";
  const visibleSections = filterNavSections(NAV_SECTIONS, (permission) =>
    can(permission as Parameters<typeof can>[0]),
  );
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const [expandedHref, setExpandedHref] = useState<string | null>(
    () => findActiveNavParent(pathname)?.href ?? null,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setCollapsed(event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setCollapsed]);

  // Keep the route's parent accordion open; collapse others.
  useEffect(() => {
    const activeParent = findActiveNavParent(pathname);
    setExpandedHref(activeParent?.href ?? null);
  }, [pathname]);

  const handleToggleExpand = (href: string) => {
    setExpandedHref((current) => (current === href ? null : href));
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-100 bg-white transition-[width] duration-200",
        isCollapsed ? "w-[72px]" : "w-[280px]",
      )}
    >
      <div className="border-b border-gray-100 px-4 py-5">
        <Link
          href={homeHref}
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <div className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <div className="relative flex items-center">
              <Wrench className="size-3.5 text-white" />
              <Hammer className="absolute -right-1.5 size-3 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#1A1A1A]">
                Bajriwala
              </p>
              <p className="truncate text-[10px] tracking-wide text-gray-400 uppercase">
                Operations Control Tower
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {visibleSections.map((section, index) => (
          <SidebarSection
            key={section.label ?? `section-${index}`}
            label={section.label}
            items={section.items}
            pathname={pathname}
            isCollapsed={isCollapsed}
            expandedHref={expandedHref}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>

      <div className="border-t border-gray-100 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isLogout = item.label === "Logout";

            return (
              <SidebarNavItem
                key={item.href}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
                isLogout={isLogout}
              />
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
