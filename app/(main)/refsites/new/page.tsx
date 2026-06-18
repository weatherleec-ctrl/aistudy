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
import { ArrowLeft, X, Globe } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewRefSitePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("OTHER")
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
    setLoading(true)
    const res = await fetch("/api/refsites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, description, imageUrl: imageUrl || undefined, category, tags }),
    })
    if (res.ok) {
      toast.success("참고 사이트가 등록되었습니다.")
      router.push("/refsites")
    } else {
      try {
        const err = await res.json()
        toast.error(err.error ?? "오류가 발생했습니다.")
      } catch {
        toast.error("저장 중 오류가 발생했습니다.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/refsites"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />참고 사이트 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>사이트 이름 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: Hugging Face" required />
            </div>

            <div className="space-y-2">
              <Label>URL *</Label>
              <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
            </div>

            <div className="space-y-2">
              <Label>썸네일 이미지 URL</Label>
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://... (OG 이미지 또는 스크린샷 URL)" />
              {imageUrl && (
                <div className="h-32 rounded border overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="미리보기" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
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
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="이 사이트에 대한 간략한 설명을 입력하세요." />
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
              <Button type="submit" disabled={loading}>{loading ? "등록 중..." : "사이트 등록"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/refsites")}>취소</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
