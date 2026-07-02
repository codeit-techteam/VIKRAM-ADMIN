import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ThemeMode } from "@/types/common";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "bq-theme-storage",
    },
  ),
);
