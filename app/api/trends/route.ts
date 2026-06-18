import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get("page") ?? "1")
  const pageSize = 12
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { summary: { contains: search } }] } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.trend.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.trend.count({ where }),
  ])
  return NextResponse.json({ items, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { title, summary, content, sourceUrl, category, tags } = await req.json()
  if (!title || !summary || !content || !category)
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 })
  const trend = await prisma.trend.create({
    data: {
      title, summary, content, sourceUrl: sourceUrl || null,
      category, tags: JSON.stringify(tags ?? []),
      authorId: session!.user.id,
    },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(trend, { status: 201 })
}
