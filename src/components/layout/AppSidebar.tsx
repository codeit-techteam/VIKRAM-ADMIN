"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect } from "react";

import { SidebarContent } from "@/components/layout/sidebar/SidebarContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

export function AppSidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  useEffect(() => {
    const tabletQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)",
    );
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const handleTabletChange = (
      event: MediaQueryListEvent | MediaQueryList,
    ) => {
      if (event.matches) {
        setCollapsed(true);
      }
    };

    const handleMobileChange = (
      event: MediaQueryListEvent | MediaQueryList,
    ) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    handleTabletChange(tabletQuery);
    handleMobileChange(mobileQuery);

    tabletQuery.addEventListener("change", handleTabletChange);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      tabletQuery.removeEventListener("change", handleTabletChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, [setCollapsed, setMobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 hidden h-screen shrink-0 flex-col border-r border-gray-100 bg-white transition-[width] duration-200 md:flex",
          isCollapsed ? "w-[72px]" : "w-[260px]",
        )}
        aria-label="Main navigation"
      >
        <SidebarContent isCollapsed={isCollapsed} />

        <div
          className={cn(
            "absolute top-[88px] -right-3 z-40 hidden lg:block",
            isCollapsed && "top-[84px]",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="size-6 rounded-full border-gray-200 bg-white shadow-sm"
            onClick={() => setCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
          </Button>
        </div>
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton>
          <SidebarContent
            isCollapsed={false}
            onNavigate={closeMobile}
            className="pt-2"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SidebarMobileTrigger() {
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="md:hidden"
      aria-label="Open navigation menu"
      onClick={() => setMobileOpen(true)}
    >
      <PanelLeftOpen className="size-5" />
    </Button>
  );
}
