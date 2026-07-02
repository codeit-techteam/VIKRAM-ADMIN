import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  setOpen: (isOpen: boolean) => void;
  setMobileOpen: (isMobileOpen: boolean) => void;
  setCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      isMobileOpen: false,
      isCollapsed: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setOpen: (isOpen) => set({ isOpen }),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: "bq-sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    },
  ),
);
