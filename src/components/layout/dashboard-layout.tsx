"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { getNavContextFromPath } from "@/constants/navigation.constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { section: sectionLabel, page: pageLabel } =
    getNavContextFromPath(pathname);

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          sectionLabel={sectionLabel}
          pageLabel={pageLabel}
          showUserId={!pathname.startsWith("/customer-app-cms/banners")}
        />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
