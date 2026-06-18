import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get("category")
  const tools = await prisma.tool.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { addedBy: { select: { id: true, name: true } } },
  })
  return NextResponse.json(tools)
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error) return error
  const { name, description, url, iconUrl, category, tags, isPaid, isFeatured } = await req.json()
  if (!name || !description || !url || !category)
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 })
  const tool = await prisma.tool.create({
    data: {
      name, description, url, iconUrl: iconUrl || null, category,
      tags: JSON.stringify(tags ?? []),
      isPaid: !!isPaid, isFeatured: !!isFeatured,
      addedById: session!.user.id,
    },
    include: { addedBy: { select: { id: true, name: true } } },
  })
  return NextResponse.json(tool, { status: 201 })
}
