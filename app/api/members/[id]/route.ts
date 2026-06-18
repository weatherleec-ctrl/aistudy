import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await params
  const member = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, expertise: true, githubUrl: true, joinedAt: true },
  })
  if (!member) return NextResponse.json({ error: "없음" }, { status: 404 })
  return NextResponse.json(member)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  const isAdmin = session!.user.role === "ADMIN"
  if (session!.user.id !== id && !isAdmin)
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  const { name, bio, expertise, githubUrl, avatarUrl, role, email, isActive } = await req.json()
  const data: Record<string, unknown> = {
    name,
    bio: bio || null,
    expertise: expertise || null,
    githubUrl: githubUrl || null,
    avatarUrl: avatarUrl || null,
  }
  if (isAdmin) {
    if (role) data.role = role
    if (email) data.email = email
    if (typeof isActive === "boolean") data.isActive = isActive
  }
  const member = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, expertise: true, githubUrl: true, joinedAt: true, isActive: true },
  })
  return NextResponse.json(member)
}
