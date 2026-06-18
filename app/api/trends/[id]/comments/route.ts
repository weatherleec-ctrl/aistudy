import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 })
  const comment = await prisma.comment.create({
    data: { content, authorId: session!.user.id, trendId: id },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { searchParams } = req.nextUrl
  const commentId = searchParams.get("commentId")
  if (!commentId) return NextResponse.json({ error: "commentId 필요" }, { status: 400 })
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return NextResponse.json({ error: "없음" }, { status: 404 })
  if (comment.authorId !== session!.user.id && session!.user.role !== "ADMIN")
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  await prisma.comment.delete({ where: { id: commentId } })
  return NextResponse.json({ ok: true })
}
