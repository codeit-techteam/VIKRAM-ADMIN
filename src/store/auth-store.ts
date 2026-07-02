import { create } from "zustand";
import { persist } from "zustand/middleware";

import { env } from "@/config/env";
import type { User } from "@/types/auth";
import { clearAuthCookies, setAuthCookies } from "@/utils/auth-cookies";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, accessToken, refreshToken) => {
        setStoredTokens(accessToken, refreshToken);
        setAuthCookies(accessToken, refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: () => {
        clearStoredTokens();
        clearAuthCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "bq-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(env.authTokenKey);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(env.authRefreshTokenKey);
};

export const setStoredTokens = (
  accessToken: string,
  refreshToken: string,
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(env.authTokenKey, accessToken);
  localStorage.setItem(env.authRefreshTokenKey, refreshToken);
};

export const clearStoredTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(env.authTokenKey);
  localStorage.removeItem(env.authRefreshTokenKey);
};
