"use client";

import { Menu } from "lucide-react";

import { AppBreadcrumb } from "@/components/layout/app-breadcrumb";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/store/sidebar-store";
import type { BreadcrumbItem } from "@/types/common";

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs }: AppHeaderProps) {
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b px-4 backdrop-blur lg:px-6">
      <SidebarTrigger className="hidden lg:flex" />
      <Button
        variant="ghost"
        size="icon"
        className="size-9 lg:hidden"
        onClick={toggleMobile}
      >
        <Menu className="size-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <Separator orientation="vertical" className="hidden h-6 lg:block" />

      <div className="hidden flex-1 lg:block">
        <AppBreadcrumb items={breadcrumbs} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <ThemeSwitch />
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
