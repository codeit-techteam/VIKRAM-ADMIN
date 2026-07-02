"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface SubModuleTab {
  id: string;
  label: string;
  href?: string;
}

interface SubModuleTabsProps {
  backHref: string;
  backLabel: string;
  tabs: SubModuleTab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function SubModuleTabs({
  backHref,
  backLabel,
  tabs,
  activeTab,
  onTabChange,
  className,
}: SubModuleTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-gray-100 bg-white px-0 pb-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1A1A1A]"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      <nav
        className="flex items-center gap-6"
        aria-label="Sub-module navigation"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          const tabClassName = cn(
            "relative pb-3 text-sm font-medium transition-colors",
            isActive ? "text-primary" : "text-[#64748B] hover:text-[#1A1A1A]",
          );

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={tabClassName}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
                {isActive ? (
                  <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
                ) : null}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={tabClassName}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {isActive ? (
                <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
