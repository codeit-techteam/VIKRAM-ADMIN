"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, Wrench } from "lucide-react";
import { useEffect } from "react";

import { SidebarFavorites } from "@/components/layout/sidebar/SidebarFavorites";
import { SidebarGroup } from "@/components/layout/sidebar/SidebarGroup";
import { SidebarItem } from "@/components/layout/sidebar/SidebarItem";
import { SidebarSearch } from "@/components/layout/sidebar/SidebarSearch";
import {
  BOTTOM_NAV_ITEMS,
  filterNavSections,
  findParentNavItem,
  NAV_SECTIONS,
} from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SidebarContentProps {
  isCollapsed: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarContent({
  isCollapsed,
  onNavigate,
  className,
}: SidebarContentProps) {
  const pathname = usePathname();
  const searchQuery = useSidebarStore((state) => state.searchQuery);
  const expandedAccordionId = useSidebarStore(
    (state) => state.expandedAccordionId,
  );
  const setExpandedAccordionId = useSidebarStore(
    (state) => state.setExpandedAccordionId,
  );

  useEffect(() => {
    const parent = findParentNavItem(pathname);

    if (parent?.children?.length) {
      setExpandedAccordionId(parent.id);
      return;
    }

    setExpandedAccordionId(null);
  }, [pathname, setExpandedAccordionId]);

  const filteredSections = filterNavSections(NAV_SECTIONS, searchQuery);

  const handleAccordionToggle = (id: string) => {
    setExpandedAccordionId(expandedAccordionId === id ? null : id);
  };

  return (
    <TooltipProvider delay={200}>
      <div className={cn("flex h-full flex-col", className)}>
        <div className="border-b border-gray-100 px-4 py-5">
          <Link
            href="/dashboard"
            className={cn(
              "focus-visible:ring-primary/30 flex items-center gap-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none",
              isCollapsed && "justify-center",
            )}
            onClick={onNavigate}
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

        <SidebarSearch isCollapsed={isCollapsed} />

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SidebarFavorites
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />

          {filteredSections.map((section, index) => (
            <SidebarGroup
              key={section.label ?? `section-${index}`}
              label={section.label}
              items={section.items}
              pathname={pathname}
              isCollapsed={isCollapsed}
              expandedAccordionId={expandedAccordionId}
              onAccordionToggle={handleAccordionToggle}
              onNavigate={onNavigate}
            />
          ))}

          {searchQuery && filteredSections.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">
              No menu items found
            </p>
          ) : null}
        </div>

        <div className="border-t border-gray-100 px-3 py-4">
          <nav aria-label="Account" className="flex flex-col gap-0.5">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isLogout = item.label === "Logout";

              return (
                <SidebarItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  isLogout={isLogout}
                  onNavigate={onNavigate}
                />
              );
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
