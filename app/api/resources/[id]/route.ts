import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true } } },
  })
  if (!resource) return NextResponse.json({ error: "없음" }, { status: 404 })
  await prisma.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } })
  return NextResponse.json(resource)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (resource.uploaderId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  const { title, description, url, tags } = await req.json()
  const updated = await prisma.resource.update({
    where: { id },
    data: {
      title,
      description: description || null,
      url: url || null,
      tags: JSON.stringify(tags ?? []),
    },
    include: { uploader: { select: { id: true, name: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (resource.uploaderId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  await prisma.resource.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
