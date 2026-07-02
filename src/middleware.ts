import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestRoute(pathname) && token) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
