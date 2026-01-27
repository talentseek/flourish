"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/")
  }

  // Better Auth handles sign out on client side usually.
  // This server action is effectively a no-op or just a redirect.
  redirect("/")
}
