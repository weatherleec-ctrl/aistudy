"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ExternalLink, Pencil, Trash2, Globe } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { parseTags, formatRelative } from "@/lib/utils"

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "AI", label: "AI" },
  { value: "DEV", label: "개발" },
  { value: "RESEARCH", label: "연구/논문" },
  { value: "DATASET", label: "데이터셋" },
  { value: "COMMUNITY", label: "커뮤니티" },
  { value: "NEWS", label: "뉴스" },
  { value: "OTHER", label: "기타" },
]

export default function RefSitesPage() {
  const { data: session } = useSession()
  const [sites, setSites] = useState<any[]>([])
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (query) params.set("search", query)
      const res = await fetch(`/api/refsites?${params}`)
      const data = await res.json()
      setSites(Array.isArray(data) ? data : [])
    } catch {
      toast.error("목록을 불러오는 중 오류가 발생했습니다.")
      setSites([])
    }
    setLoading(false)
  }, [category, query])

  useEffect(() => { fetchSites() }, [fetchSites])

  function canEdit(s: any) {
    return session?.user?.id === s.addedBy?.id || session?.user?.role === "ADMIN"
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/refsites/${id}`, { method: "DELETE" })
    if (res.ok) {
      setSites(prev => prev.filter(s => s.id !== id))
      toast.success("삭제되었습니다.")
    } else {
      toast.error("삭제 중 오류가 발생했습니다.")
    }
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  return (
    <div className="space-y-4">
      {/* 검색 + 추가 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="사이트 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setQuery(search) } }}
          />
          <Button variant="outline" size="icon" onClick={() => setQuery(search)}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild><Link href="/refsites/new"><Plus className="h-4 w-4 mr-1" />사이트 추가</Link></Button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <Button key={c.value} variant={category === c.value ? "default" : "outline"} size="sm"
            onClick={() => setCategory(c.value)}>{c.label}</Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">총 {sites.length}개</p>

      {/* 카드 그리드 */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>등록된 참고 사이트가 없습니다.</p>
          <Button variant="outline" className="mt-4" asChild><Link href="/refsites/new">첫 사이트 추가</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map(s => {
            const tags = parseTags(s.tags ?? "[]")
            const catLabel = CATEGORIES.find(c => c.value === s.category)?.label ?? s.category
            return (
              <div key={s.id} className="rounded-lg border bg-card hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                {/* 썸네일 */}
                <Link href={`/refsites/${s.id}`} className="block">
                  {s.imageUrl ? (
                    <div className="h-36 bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Globe className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                </Link>

                {/* 본문 */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/refsites/${s.id}`} className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 flex-1">
                      {s.title}
                    </Link>
                    <Badge variant="secondary" className="text-xs shrink-0">{catLabel}</Badge>
                  </div>

                  {s.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />사이트 열기
                    </a>

                    {canEdit(s) && (
                      confirmDeleteId === s.id ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-destructive">삭제?</span>
                          <button onClick={() => handleDelete(s.id)} disabled={deleting}
                            className="text-destructive font-semibold hover:underline disabled:opacity-50">확인</button>
                          <span className="text-muted-foreground">|</span>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground hover:text-foreground">취소</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Link href={`/refsites/${s.id}/edit`}
                            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary border rounded px-1.5 py-0.5 transition-colors">
                            <Pencil className="h-3 w-3" />수정
                          </Link>
                          <button onClick={() => setConfirmDeleteId(s.id)}
                            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive border rounded px-1.5 py-0.5 transition-colors">
                            <Trash2 className="h-3 w-3" />삭제
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
