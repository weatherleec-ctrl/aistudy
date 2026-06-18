import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const where = {
    ...(start && end ? { startAt: { gte: new Date(start), lte: new Date(end) } } : {}),
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startAt: "asc" },
    include: {
      creator: { select: { id: true, name: true } },
      attendances: { include: { user: { select: { id: true, name: true } } } },
    },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { title, description, location, eventType, startAt, endAt, isOnline, meetingUrl, maxAttendees } = await req.json()
  if (!title || !startAt || !endAt)
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 })
  const event = await prisma.event.create({
    data: {
      title, description: description || null, location: location || null,
      eventType: eventType || "STUDY",
      startAt: new Date(startAt), endAt: new Date(endAt),
      isOnline: !!isOnline, meetingUrl: meetingUrl || null,
      maxAttendees: maxAttendees || null,
      creatorId: session!.user.id,
    },
    include: { creator: { select: { id: true, name: true } }, attendances: true },
  })
  return NextResponse.json(event, { status: 201 })
}
