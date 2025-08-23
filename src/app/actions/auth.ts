"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/")
  }

  // Clear the session by redirecting to Clerk's sign-out
  redirect("/sign-out")
}
