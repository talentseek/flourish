import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Enable Clerk middleware only when a plausibly valid publishable key is configured
const hasValidClerkPk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

const noopMiddleware = () => NextResponse.next();

export default (hasValidClerkPk ? clerkMiddleware() : noopMiddleware);

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
