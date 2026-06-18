import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get("page") ?? "1")
  const pageSize = 12
  const type = searchParams.get("type")
  const search = searchParams.get("search")

  const where = {
    ...(type ? { type } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { uploader: { select: { id: true, name: true } } },
    }),
    prisma.resource.count({ where }),
  ])
  return NextResponse.json({ items, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { title, description, type, url, filePath, fileName, fileSize, mimeType, tags } = await req.json()
  if (!title || !type) return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 })
  const resource = await prisma.resource.create({
    data: {
      title, description: description || null, type, url: url || null,
      filePath: filePath || null, fileName: fileName || null,
      fileSize: fileSize || null, mimeType: mimeType || null,
      tags: JSON.stringify(tags ?? []),
      uploaderId: session!.user.id,
    },
    include: { uploader: { select: { id: true, name: true } } },
  })
  return NextResponse.json(resource, { status: 201 })
}
