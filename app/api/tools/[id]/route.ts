import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tool = await prisma.tool.findUnique({ where: { id }, include: { addedBy: { select: { id: true, name: true } } } })
  if (!tool) return NextResponse.json({ error: "없음" }, { status: 404 })
  return NextResponse.json(tool)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const data = await req.json()
  if (data.tags) data.tags = JSON.stringify(data.tags)
  const tool = await prisma.tool.update({ where: { id }, data, include: { addedBy: { select: { id: true, name: true } } } })
  return NextResponse.json(tool)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  await prisma.tool.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
