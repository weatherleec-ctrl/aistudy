"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X, FileText, Link2, Video, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { parseTags } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = { FILE: "파일", LINK: "링크", VIDEO: "영상", NOTION: "노션" }
const TYPE_ICONS: Record<string, React.ReactNode> = {
  FILE: <FileText className="h-4 w-4 text-blue-500" />,
  LINK: <Link2 className="h-4 w-4 text-green-500" />,
  VIDEO: <Video className="h-4 w-4 text-red-500" />,
  NOTION: <BookOpen className="h-4 w-4 text-gray-500" />,
}

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [type, setType] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title ?? "")
        setDescription(data.description ?? "")
        setUrl(data.url ?? "")
        setType(data.type ?? "")
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
    const res = await fetch(`/api/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, url: type !== "FILE" ? url : undefined, tags }),
    })
    if (res.ok) {
      toast.success("자료가 수정되었습니다.")
      router.push("/resources")
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
          <Link href="/resources"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {TYPE_ICONS[type]}
            자료 수정
            <Badge variant="outline" className="ml-1 text-xs">{TYPE_LABELS[type] ?? type}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {type !== "FILE" && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
            )}

            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 입력 후 Enter"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                />
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

            {type === "FILE" && (
              <p className="text-xs text-muted-foreground bg-muted p-3 rounded">
                파일 자체는 수정할 수 없습니다. 새 파일을 올리려면 기존 자료를 삭제 후 새로 등록해 주세요.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "저장 중..." : "저장"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/resources")}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
