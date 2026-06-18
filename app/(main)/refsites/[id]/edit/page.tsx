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

export default function EditRefSitePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("OTHER")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/refsites/${id}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title ?? "")
        setUrl(data.url ?? "")
        setDescription(data.description ?? "")
        setImageUrl(data.imageUrl ?? "")
        setCategory(data.category ?? "OTHER")
        setTags(parseTags(data.tags ?? "[]"))
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
    setLoading(true)
    const res = await fetch(`/api/refsites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, description, imageUrl: imageUrl || undefined, category, tags }),
    })
    if (res.ok) {
      toast.success("수정되었습니다.")
      router.push(`/refsites/${id}`)
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
          <Link href={`/refsites/${id}`}><ArrowLeft className="h-4 w-4 mr-1" />상세보기</Link>
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>참고 사이트 수정</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>사이트 이름 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>썸네일 이미지 URL</Label>
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              {imageUrl && (
                <div className="h-32 rounded border overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="미리보기" className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={(v: string | null) => v && setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="DEV">개발</SelectItem>
                  <SelectItem value="RESEARCH">연구/논문</SelectItem>
                  <SelectItem value="DATASET">데이터셋</SelectItem>
                  <SelectItem value="COMMUNITY">커뮤니티</SelectItem>
                  <SelectItem value="NEWS">뉴스</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 입력 후 Enter"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
                <Button type="button" variant="outline" onClick={addTag}>추가</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>{loading ? "저장 중..." : "저장"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/refsites/${id}`)}>취소</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
