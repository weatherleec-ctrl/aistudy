import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
  if (file.size > 50 * 1024 * 1024)
    return NextResponse.json({ error: "파일 크기는 50MB 이하여야 합니다." }, { status: 400 })

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })

  const ext = path.extname(file.name)
  const uniqueName = `${randomUUID()}${ext}`
  const filePath = path.join(uploadDir, uniqueName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return NextResponse.json({
    filePath: `/uploads/${uniqueName}`,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  })
}
