import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error
  const members = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, expertise: true, githubUrl: true, joinedAt: true },
  })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  const { email, name, password, role } = await req.json()
  if (!email || !name || !password) return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 })
  const bcrypt = await import("bcryptjs")
  const passwordHash = await bcrypt.hash(password, 10)
  const member = await prisma.user.create({
    data: { email, name, passwordHash, role: role === "ADMIN" ? "ADMIN" : "MEMBER" },
    select: { id: true, name: true, email: true, role: true, joinedAt: true },
  })
  return NextResponse.json(member, { status: 201 })
}
