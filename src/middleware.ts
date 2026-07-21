import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ROLES, type Role } from "@/constants/roles";
import {
  canAccessPath,
  getDefaultRouteForRole,
} from "@/constants/route-access";
import { GUEST_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/constants/routes";

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const isGuestRoute = (pathname: string): boolean =>
  GUEST_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bq_access_token")?.value;
  const role = request.cookies.get("bq_user_role")?.value as Role | undefined;

  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    token &&
    role &&
    isProtectedRoute(pathname) &&
    pathname !== ROUTES.FORBIDDEN &&
    pathname !== ROUTES.UNAUTHORIZED
  ) {
    if (!canAccessPath(role, pathname)) {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(role), request.url),
      );
    }
  }

  if (isGuestRoute(pathname) && token) {
    const defaultRoute =
      role === ROLES.WAREHOUSE_MANAGER
        ? "/central-warehouse"
        : role === ROLES.CUSTOMER_EXECUTIVE
          ? "/customer-executive"
          : ROUTES.DASHBOARD;
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
