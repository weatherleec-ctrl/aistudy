import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error) return error
  const { title, content, isPinned, isImportant } = await req.json()
  if (!title || !content) return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 })
  const announcement = await prisma.announcement.create({
    data: { title, content, isPinned: !!isPinned, isImportant: !!isImportant, authorId: session!.user.id },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(announcement, { status: 201 })
}
