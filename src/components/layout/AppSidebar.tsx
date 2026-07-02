"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, Wrench } from "lucide-react";
import { useEffect } from "react";

import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import {
  BOTTOM_NAV_ITEMS,
  NAV_SECTIONS,
} from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

export function AppSidebar() {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setCollapsed(event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setCollapsed]);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-100 bg-white",
        isCollapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="border-b border-gray-100 px-4 py-5">
        <Link
          href="/dashboard"
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
                BuildQuick India
              </p>
              <p className="truncate text-[10px] tracking-wide text-gray-400 uppercase">
                Super Admin Control Tower
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, index) => (
          <SidebarSection
            key={section.label ?? `section-${index}`}
            label={section.label}
            items={section.items}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <div className="border-t border-gray-100 px-3 py-4">
        <nav className="flex flex-col gap-0.5">
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
