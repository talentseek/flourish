import { redirect } from "next/navigation"

export async function GET() {
  // Simple redirect to home page - middleware will handle authentication
  redirect("/")
}
