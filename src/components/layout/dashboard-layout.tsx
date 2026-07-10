"use client";

import { usePathname } from "next/navigation";

import {
  AppSidebar,
  SidebarMobileTrigger,
} from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LayoutBreadcrumb } from "@/components/layout/LayoutBreadcrumb";
import { getNavContextFromPath } from "@/constants/navigation.constants";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const { section: sectionLabel, page: pageLabel } =
    getNavContextFromPath(pathname);
  const isMinimalTopbar = pathname.startsWith(
    "/customer-app-cms/videos/upload",
  );
  const isRequisitionsPage = pathname.startsWith(
    "/central-warehouse/requisitions",
  );

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      <AppSidebar />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-200",
          "md:ml-[72px]",
          !isCollapsed && "lg:ml-[260px]",
        )}
      >
        <AppTopbar
          sectionLabel={sectionLabel}
          pageLabel={pageLabel}
          showUserId={!pathname.startsWith("/customer-app-cms/banners")}
          variant={isMinimalTopbar ? "minimal" : "default"}
          searchPlaceholder={
            isRequisitionsPage
              ? "Search Requisitions, Hubs or Materials..."
              : undefined
          }
          mobileNavTrigger={<SidebarMobileTrigger />}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <LayoutBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
