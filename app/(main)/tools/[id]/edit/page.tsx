"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { parseTags } from "@/lib/utils"

export default function EditToolPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tools/${id}`)
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? "")
        setDescription(data.description ?? "")
        setUrl(data.url ?? "")
        setIconUrl(data.iconUrl ?? "")
        setCategory(data.category ?? "")
        setTags(parseTags(data.tags ?? "[]"))
        setIsPaid(data.isPaid ?? false)
        setIsFeatured(data.isFeatured ?? false)
        setInitialLoading(false)
      })
  }, [id])

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { toast.error("카테고리를 선택해 주세요."); return }
    setLoading(true)
    const res = await fetch(`/api/tools/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, url, iconUrl: iconUrl || undefined, category, tags, isPaid, isFeatured }),
    })
    if (res.ok) {
      toast.success("수정되었습니다.")
      router.push("/tools")
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  if (initialLoading) return <div className="animate-pulse h-40 bg-muted rounded" />

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tools"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link>
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>AI 도구 수정</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>도구 이름 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>URL *</Label><Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required /></div>
            <div className="space-y-2">
              <Label>카테고리 *</Label>
              <Select value={category} onValueChange={(v: string | null) => v && setCategory(v)}>
                <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHATBOT">대화형 AI</SelectItem>
                  <SelectItem value="CODING">코딩 보조</SelectItem>
                  <SelectItem value="IMAGE">이미지 생성</SelectItem>
                  <SelectItem value="VIDEO">영상 생성</SelectItem>
                  <SelectItem value="AUDIO">음성/음악</SelectItem>
                  <SelectItem value="PRODUCTIVITY">생산성</SelectItem>
                  <SelectItem value="RESEARCH">리서치</SelectItem>
                  <SelectItem value="DATA">데이터</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>설명 *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required /></div>
            <div className="space-y-2"><Label>아이콘 URL (선택)</Label><Input type="url" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Enter로 추가"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
                <Button type="button" variant="outline" onClick={addTag}>추가</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />유료
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />추천 도구
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "저장 중..." : "저장"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/tools")}>취소</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
