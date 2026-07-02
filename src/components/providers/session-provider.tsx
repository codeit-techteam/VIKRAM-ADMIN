"use client";

import { useEffect } from "react";

import { isDevMockToken } from "@/constants/dev-auth.constants";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
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
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [accessToken, isAuthenticated, setUser, setLoading, logout]);

  return children;
}
