import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const a = await prisma.announcement.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  })
  if (!a) return NextResponse.json({ error: "없음" }, { status: 404 })
  return NextResponse.json(a)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const data = await req.json()
  const a = await prisma.announcement.update({ where: { id }, data })
  return NextResponse.json(a)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const data = await req.json()
  const a = await prisma.announcement.update({ where: { id }, data, include: { author: { select: { id: true, name: true } } } })
  return NextResponse.json(a)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
