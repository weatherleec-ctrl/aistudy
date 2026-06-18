"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const CATEGORIES = [
  { value: "LLM", label: "대형 언어 모델" }, { value: "VISION", label: "비전/이미지" },
  { value: "MULTIMODAL", label: "멀티모달" }, { value: "AGENT", label: "AI 에이전트" },
  { value: "TOOLS", label: "개발 도구" }, { value: "RESEARCH", label: "연구/논문" },
  { value: "INDUSTRY", label: "산업 동향" }, { value: "OTHER", label: "기타" },
]

export default function NewTrendPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { toast.error("카테고리를 선택해 주세요."); return }
    setLoading(true)
    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, content, sourceUrl, category, tags }),
    })
    if (res.ok) {
      const trend = await res.json()
      toast.success("동향이 등록되었습니다.")
      router.push(`/trends/${trend.id}`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/trends"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>AI 동향 작성</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>카테고리 *</Label>
              <Select onValueChange={(v: string | null) => v && setCategory(v)}>
                <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>요약 *</Label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>본문 * (마크다운 지원)</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} required />
            </div>
            <div className="space-y-2">
              <Label>출처 URL</Label>
              <Input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="태그 입력 후 Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
                <Button type="button" variant="outline" onClick={addTag}>추가</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}<button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading}>{loading ? "등록 중..." : "동향 등록"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
