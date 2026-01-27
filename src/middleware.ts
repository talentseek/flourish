
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Better Auth can use different cookie names depending on configuration
  // Check for multiple possible session cookie names
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("better-auth.session") ||
    request.cookies.get("__session") ||
    request.cookies.get("session_token");

  // Log cookies for debugging (will show in Vercel logs)
  const allCookies = request.cookies.getAll();
  console.log("[Middleware] Path:", request.nextUrl.pathname);
  console.log("[Middleware] Cookies:", allCookies.map(c => c.name).join(", "));
  console.log("[Middleware] Session found:", !!sessionCookie);

  // Define protected routes
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/sign-up") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  // Redirect unauthenticated users accessing dashboard
  if (isDashboard && !sessionCookie) {
    console.log("[Middleware] No session, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users trying to access auth pages
  if (isAuthRoute && sessionCookie) {
    console.log("[Middleware] Session found, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/sign-up", "/forgot-password"]
};
