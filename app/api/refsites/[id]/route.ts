import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await params
  const site = await prisma.refSite.findUnique({
    where: { id },
    include: { addedBy: { select: { id: true, name: true } } },
  })
  if (!site) return NextResponse.json({ error: "없음" }, { status: 404 })
  return NextResponse.json(site)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const site = await prisma.refSite.findUnique({ where: { id } })
  if (!site) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (site.addedById !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  const { title, url, description, imageUrl, category, tags } = await req.json()
  const updated = await prisma.refSite.update({
    where: { id },
    data: {
      title,
      url,
      description: description || null,
      imageUrl: imageUrl || null,
      category: category || "OTHER",
      tags: JSON.stringify(tags ?? []),
    },
    include: { addedBy: { select: { id: true, name: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const site = await prisma.refSite.findUnique({ where: { id } })
  if (!site) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (site.addedById !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  await prisma.refSite.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
