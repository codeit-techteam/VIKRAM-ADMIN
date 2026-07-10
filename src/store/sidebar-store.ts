import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_FAVORITES } from "@/constants/navigation.constants";

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
  isCollapsed: boolean;
  expandedAccordionId: string | null;
  searchQuery: string;
  favorites: string[];
  toggle: () => void;
  toggleMobile: () => void;
  setOpen: (isOpen: boolean) => void;
  setMobileOpen: (isMobileOpen: boolean) => void;
  setCollapsed: (isCollapsed: boolean) => void;
  setExpandedAccordionId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isOpen: true,
      isMobileOpen: false,
      isCollapsed: false,
      expandedAccordionId: null,
      searchQuery: "",
      favorites: [...DEFAULT_FAVORITES],
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setOpen: (isOpen) => set({ isOpen }),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      setExpandedAccordionId: (expandedAccordionId) =>
        set({ expandedAccordionId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      toggleFavorite: (href) =>
        set((state) => {
          const exists = state.favorites.includes(href);
          return {
            favorites: exists
              ? state.favorites.filter((favorite) => favorite !== href)
              : [...state.favorites, href],
          };
        }),
      isFavorite: (href) => get().favorites.includes(href),
    }),
    {
      name: "bq-sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        favorites: state.favorites,
      }),
    },
  ),
);
