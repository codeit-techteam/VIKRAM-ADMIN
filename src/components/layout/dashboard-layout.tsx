"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { RouteAccessGuard } from "@/components/common/route-access-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { getNavContextFromPath } from "@/constants/navigation.constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
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

      <div className="flex min-w-0 flex-1 flex-col">
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
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <RouteAccessGuard>{children}</RouteAccessGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
