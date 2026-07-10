"use client";

import { Star } from "lucide-react";

import { SidebarItem } from "@/components/layout/sidebar/SidebarItem";
import { getFavoriteNavItems } from "@/constants/navigation.constants";
import { useSidebarStore } from "@/store/sidebar-store";

interface SidebarFavoritesProps {
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarFavorites({
  pathname,
  isCollapsed,
  onNavigate,
}: SidebarFavoritesProps) {
  const favorites = useSidebarStore((state) => state.favorites);
  const favoriteItems = getFavoriteNavItems(favorites);

  if (isCollapsed || favoriteItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 px-3">
        <Star className="fill-primary text-primary size-3" aria-hidden="true" />
        <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
          Favorites
        </p>
      </div>

      <nav aria-label="Favorites" className="flex flex-col gap-0.5">
        {favoriteItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            isCollapsed={isCollapsed}
            isChild
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}
