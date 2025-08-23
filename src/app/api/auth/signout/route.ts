import { NextResponse } from "next/server";

export async function GET() {
  // Redirect to Clerk's sign-out page
  return NextResponse.redirect(new URL("/sign-out", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "http://localhost:3000"));
}
