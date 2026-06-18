"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, isPinned, isImportant }),
    })
    if (res.ok) {
      toast.success("공지사항이 등록되었습니다.")
      router.push("/announcements")
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/announcements"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>공지사항 작성</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용 * (마크다운 지원)</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
                상단 고정
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                중요 공지
              </label>
            </div>
            <Button type="submit" disabled={loading}>{loading ? "등록 중..." : "공지 등록"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
