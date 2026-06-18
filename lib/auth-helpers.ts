import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }), session: null }
  }
  return { error: null, session }
}

export async function requireAdmin() {
  const { error, session } = await requireAuth()
  if (error) return { error, session: null }
  if (session!.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }), session: null }
  }
  return { error: null, session }
}
