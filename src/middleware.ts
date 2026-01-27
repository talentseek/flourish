
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Better Auth uses this exact cookie name
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Define protected routes
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/sign-up") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password");

  // For dashboard routes: let the page handle auth check
  // Don't do middleware redirect - the page will check session validity
  if (isDashboard) {
    return NextResponse.next();
  }

  // For auth routes: if there's a session cookie, redirect to dashboard
  // The dashboard page will verify if the session is actually valid
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/sign-up", "/forgot-password", "/reset-password"]
};
