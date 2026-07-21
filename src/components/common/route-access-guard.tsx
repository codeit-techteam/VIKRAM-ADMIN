"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  canAccessPath,
  getDefaultRouteForRole,
} from "@/constants/route-access";
import { useAuth } from "@/hooks/use-auth";

interface RouteAccessGuardProps {
  children: React.ReactNode;
}

/** Client-side route guard — redirects unauthorized users to /forbidden */
export function RouteAccessGuard({ children }: RouteAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.role) return;

    if (!canAccessPath(user.role, pathname, user.permissions)) {
      router.replace(getDefaultRouteForRole(user.role));
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  return children;
}
