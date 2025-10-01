import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        county: true,
        type: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Failed to fetch locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

