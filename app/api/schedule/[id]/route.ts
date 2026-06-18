import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true } },
      attendances: { include: { user: { select: { id: true, name: true } } } },
    },
  })
  if (!event) return NextResponse.json({ error: "없음" }, { status: 404 })
  return NextResponse.json(event)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (event.creatorId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  const data = await req.json()
  if (data.startAt) data.startAt = new Date(data.startAt)
  if (data.endAt) data.endAt = new Date(data.endAt)
  const updated = await prisma.event.update({ where: { id }, data, include: { creator: { select: { id: true, name: true } }, attendances: true } })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (event.creatorId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  await prisma.attendance.deleteMany({ where: { eventId: id } })
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
