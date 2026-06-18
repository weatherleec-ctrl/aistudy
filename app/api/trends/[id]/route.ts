import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trend = await prisma.trend.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } }, comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } } },
  })
  if (!trend) return NextResponse.json({ error: "없음" }, { status: 404 })
  await prisma.trend.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  return NextResponse.json(trend)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const trend = await prisma.trend.findUnique({ where: { id } })
  if (!trend) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (trend.authorId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  const { title, summary, content, sourceUrl, category, tags } = await req.json()
  const updated = await prisma.trend.update({
    where: { id },
    data: { title, summary, content, sourceUrl: sourceUrl || null, category, tags: JSON.stringify(tags ?? []) },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const trend = await prisma.trend.findUnique({ where: { id } })
  if (!trend) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (trend.authorId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  await prisma.comment.deleteMany({ where: { trendId: id } })
  await prisma.trend.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
