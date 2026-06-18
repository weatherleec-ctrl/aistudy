"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { formatFileSize } from "@/lib/utils"

export default function NewResourcePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("LINK")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    let fileData: { filePath?: string; fileName?: string; fileSize?: number; mimeType?: string } = {}

    if (type === "FILE" && file) {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/resources/upload", { method: "POST", body: fd })
      if (!res.ok) { toast.error("파일 업로드 실패"); setLoading(false); setUploading(false); return }
      fileData = await res.json()
      setUploading(false)
    }

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type, url: type !== "FILE" ? url : undefined, tags, ...fileData }),
    })
    if (res.ok) {
      toast.success("자료가 등록되었습니다.")
      router.push("/resources")
    } else {
      try {
        const err = await res.json()
        toast.error(err.error ?? "오류가 발생했습니다.")
      } catch {
        toast.error("오류가 발생했습니다.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/resources"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>자료 올리기</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>자료 유형 *</Label>
              <Select value={type} onValueChange={(v: string | null) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILE">파일 업로드</SelectItem>
                  <SelectItem value="LINK">링크</SelectItem>
                  <SelectItem value="VIDEO">영상</SelectItem>
                  <SelectItem value="NOTION">노션</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            {type === "FILE" ? (
              <div className="space-y-2">
                <Label>파일 * (최대 50MB)</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                    </div>
                  ) : (
                    <div><Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">클릭하여 파일 선택</p></div>
                  )}
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
              </div>
            )}
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="태그 입력 후 Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
                <Button type="button" variant="outline" onClick={addTag}>추가</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}<button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? "업로드 중..." : loading ? "등록 중..." : "자료 등록"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
