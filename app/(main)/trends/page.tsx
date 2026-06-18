"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Search, Eye } from "lucide-react"
import Link from "next/link"
import { formatRelative, parseTags } from "@/lib/utils"

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "LLM", label: "대형 언어 모델" },
  { value: "VISION", label: "비전/이미지" },
  { value: "MULTIMODAL", label: "멀티모달" },
  { value: "AGENT", label: "AI 에이전트" },
  { value: "TOOLS", label: "개발 도구" },
  { value: "RESEARCH", label: "연구/논문" },
  { value: "INDUSTRY", label: "산업 동향" },
  { value: "OTHER", label: "기타" },
]

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (category) params.set("category", category)
    if (query) params.set("search", query)
    const res = await fetch(`/api/trends?${params}`)
    const data = await res.json()
    setTrends(data.items)
    setTotal(data.total)
    setLoading(false)
  }, [page, category, query])

  useEffect(() => { fetchTrends() }, [fetchTrends])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input placeholder="검색..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setQuery(search); setPage(1) } }} />
          <Button variant="outline" size="icon" onClick={() => { setQuery(search); setPage(1) }}><Search className="h-4 w-4" /></Button>
        </div>
        <Button asChild><Link href="/trends/new"><Plus className="h-4 w-4 mr-1" />동향 작성</Link></Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button key={c.value} variant={category === c.value ? "default" : "outline"} size="sm" onClick={() => { setCategory(c.value); setPage(1) }}>{c.label}</Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">총 {total}개</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>등록된 동향이 없습니다.</p>
          <Button variant="outline" className="mt-4" asChild><Link href="/trends/new">첫 글 작성하기</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trends.map((t) => (
            <Link key={t.id} href={`/trends/${t.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{CATEGORIES.find(c => c.value === t.category)?.label ?? t.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{t.viewCount}</span>
                  </div>
                  <h3 className="font-semibold leading-snug mt-2 line-clamp-2">{t.title}</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {parseTags(t.tags).slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t.author.name} · {formatRelative(t.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {total > 12 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</Button>
          <span className="flex items-center text-sm">{page} / {Math.ceil(total / 12)}</span>
          <Button variant="outline" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      )}
    </div>
  )
}
