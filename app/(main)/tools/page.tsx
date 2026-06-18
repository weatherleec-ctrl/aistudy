"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ExternalLink, Star, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { parseTags } from "@/lib/utils"

const CATEGORIES = [
  { value: "", label: "전체" }, { value: "CHATBOT", label: "대화형 AI" }, { value: "CODING", label: "코딩 보조" },
  { value: "IMAGE", label: "이미지 생성" }, { value: "VIDEO", label: "영상 생성" }, { value: "AUDIO", label: "음성/음악" },
  { value: "PRODUCTIVITY", label: "생산성" }, { value: "RESEARCH", label: "리서치" }, { value: "DATA", label: "데이터" },
]

export default function ToolsPage() {
  const { data: session } = useSession()
  const [tools, setTools] = useState<any[]>([])
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    const params = category ? `?category=${category}` : ""
    fetch(`/api/tools${params}`).then(r => r.json()).then(data => { setTools(data); setLoading(false) })
  }, [category])

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/tools/${id}`, { method: "DELETE" })
    if (res.ok) {
      setTools(prev => prev.filter(t => t.id !== id))
      toast.success("삭제되었습니다.")
    } else {
      toast.error("삭제 중 오류가 발생했습니다.")
    }
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <Button key={c.value} variant={category === c.value ? "default" : "outline"} size="sm" onClick={() => setCategory(c.value)}>{c.label}</Button>
          ))}
        </div>
        {isAdmin && (
          <Button asChild size="sm"><Link href="/tools/new"><Plus className="h-4 w-4 mr-1" />도구 추가</Link></Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 8 }).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}</div>
      ) : tools.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">등록된 도구가 없습니다.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <Card key={tool.id} className="relative hover:shadow-md transition-shadow">
              {tool.isFeatured && <Star className="absolute top-3 right-3 h-4 w-4 text-yellow-500 fill-yellow-500" />}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  {tool.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tool.iconUrl} alt={tool.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">{tool.name.slice(0, 1)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{tool.name}</span>
                      {tool.isPaid && <Badge variant="outline" className="text-xs">유료</Badge>}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-0.5">{CATEGORIES.find(c => c.value === tool.category)?.label ?? tool.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                <div className="flex flex-wrap gap-1">
                  {parseTags(tool.tags).slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />바로가기
                  </a>
                  {isAdmin && (
                    confirmDeleteId === tool.id ? (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-destructive">삭제?</span>
                        <button onClick={() => handleDelete(tool.id)} disabled={deleting}
                          className="text-destructive font-semibold hover:underline disabled:opacity-50">확인</button>
                        <span className="text-muted-foreground">|</span>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground hover:text-foreground">취소</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Link href={`/tools/${tool.id}/edit`}
                          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary border rounded px-1.5 py-0.5 transition-colors">
                          <Pencil className="h-3 w-3" />수정
                        </Link>
                        <button onClick={() => setConfirmDeleteId(tool.id)}
                          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive border rounded px-1.5 py-0.5 transition-colors">
                          <Trash2 className="h-3 w-3" />삭제
                        </button>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
