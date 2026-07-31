"use client";

import { useEffect } from "react";

import { isDevMockToken } from "@/constants/dev-auth.constants";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { useSidebarStore } from "@/store/sidebar-store";
import { setAuthCookies } from "@/utils/auth-cookies";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // Rehydrate persisted stores only after mount so SSR HTML and client
  // hydration share the same tree (fixes Base UI useId mismatches).
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useSidebarStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const validateSession = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      if (isDevMockToken(accessToken)) {
        setLoading(false);
        return;
      }

      try {
        const user = await authService.getMe();
        setUser(user);
        if (accessToken) {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            setAuthCookies(accessToken, refreshToken, user.role);
          }
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    void validateSession();
  }, [accessToken, hasHydrated, isAuthenticated, setUser, setLoading, logout]);

  return children;
}
