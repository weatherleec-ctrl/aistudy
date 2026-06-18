import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error
  const { searchParams } = req.nextUrl
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const where = {
    ...(category ? { category } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] } : {}),
  }

  try {
    const sites = await prisma.refSite.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { addedBy: { select: { id: true, name: true } } },
    })
    return NextResponse.json(sites)
  } catch (e) {
    console.error("[GET /api/refsites]", e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { title, url, description, imageUrl, category, tags } = await req.json()
    if (!title || !url) return NextResponse.json({ error: "제목과 URL은 필수입니다." }, { status: 400 })
    const site = await prisma.refSite.create({
      data: {
        title,
        url,
        description: description || null,
        imageUrl: imageUrl || null,
        category: category || "OTHER",
        tags: JSON.stringify(tags ?? []),
        addedById: session!.user.id,
      },
      include: { addedBy: { select: { id: true, name: true } } },
    })
    return NextResponse.json(site, { status: 201 })
  } catch (e: any) {
    console.error("[POST /api/refsites]", e)
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}
