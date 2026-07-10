"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

interface SidebarSearchProps {
  isCollapsed: boolean;
}

export function SidebarSearch({ isCollapsed }: SidebarSearchProps) {
  const searchQuery = useSidebarStore((state) => state.searchQuery);
  const setSearchQuery = useSidebarStore((state) => state.setSearchQuery);

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="px-3 pb-3">
      <label htmlFor="sidebar-search" className="sr-only">
        Search menu
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="sidebar-search"
          type="search"
          value={searchQuery}
          placeholder="Search menu..."
          aria-label="Search menu"
          className={cn(
            "h-9 w-full rounded-lg border border-gray-100 bg-[#F5F6F8] pr-9 pl-9 text-sm text-[#1A1A1A] transition-colors",
            "placeholder:text-gray-400",
            "focus-visible:border-primary/30 focus-visible:ring-primary/20 focus-visible:ring-2 focus-visible:outline-none",
          )}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            className="focus-visible:ring-primary/30 absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => setSearchQuery("")}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
