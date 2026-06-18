import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const { status } = await req.json()
  const attendance = await prisma.attendance.upsert({
    where: { userId_eventId: { userId: session!.user.id, eventId: id } },
    update: { status: status || "ATTENDING" },
    create: { userId: session!.user.id, eventId: id, status: status || "ATTENDING" },
  })
  return NextResponse.json(attendance)
}
