import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error
  const q = req.nextUrl.searchParams.get("q") ?? ""
  if (q.length < 2) return NextResponse.json({ trends: [], resources: [], tools: [], members: [] })

  const [trends, resources, tools, members] = await Promise.all([
    prisma.trend.findMany({ where: { OR: [{ title: { contains: q } }, { summary: { contains: q } }] }, take: 5, select: { id: true, title: true, category: true } }),
    prisma.resource.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: 5, select: { id: true, title: true, type: true } }),
    prisma.tool.findMany({ where: { OR: [{ name: { contains: q } }, { description: { contains: q } }] }, take: 5, select: { id: true, name: true, category: true } }),
    prisma.user.findMany({ where: { OR: [{ name: { contains: q } }, { expertise: { contains: q } }], isActive: true }, take: 5, select: { id: true, name: true, expertise: true } }),
  ])
  return NextResponse.json({ trends, resources, tools, members })
}
