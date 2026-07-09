"use client";

import Link from "next/link";

import { USER_MANAGEMENT_TABS } from "@/constants/user-management-navigation.constants";
import { cn } from "@/lib/utils";

interface UserManagementTabsProps {
  activeTab: string;
  className?: string;
}

export function UserManagementTabs({
  activeTab,
  className,
}: UserManagementTabsProps) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-6 border-b border-gray-100",
        className,
      )}
      aria-label="User management sections"
    >
      {USER_MANAGEMENT_TABS.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-[#64748B] hover:text-[#1A1A1A]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive ? (
              <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
