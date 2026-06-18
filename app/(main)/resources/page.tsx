"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Download, FileText, Link2, Video, BookOpen, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { formatRelative, formatFileSize, parseTags } from "@/lib/utils"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  FILE: <FileText className="h-5 w-5 text-blue-500" />,
  LINK: <Link2 className="h-5 w-5 text-green-500" />,
  VIDEO: <Video className="h-5 w-5 text-red-500" />,
  NOTION: <BookOpen className="h-5 w-5 text-gray-500" />,
}
const TYPE_LABELS: Record<string, string> = { FILE: "파일", LINK: "링크", VIDEO: "영상", NOTION: "노션" }

export default function ResourcesPage() {
  const { data: session } = useSession()
  const [resources, setResources] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("")
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (typeFilter) params.set("type", typeFilter)
    if (query) params.set("search", query)
    const res = await fetch(`/api/resources?${params}`)
    const data = await res.json()
    setResources(data.items)
    setTotal(data.total)
    setLoading(false)
  }, [page, typeFilter, query])

  useEffect(() => { fetchResources() }, [fetchResources])

  function canEdit(r: any) {
    return session?.user?.id === r.uploader?.id || session?.user?.role === "ADMIN"
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" })
    if (res.ok) {
      setResources(prev => prev.filter(r => r.id !== id))
      setTotal(prev => prev - 1)
      toast.success("자료가 삭제되었습니다.")
    } else {
      toast.error("삭제 중 오류가 발생했습니다.")
    }
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setQuery(search); setPage(1) } }}
          />
          <Button variant="outline" size="icon" onClick={() => { setQuery(search); setPage(1) }}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild><Link href="/resources/new"><Plus className="h-4 w-4 mr-1" />자료 올리기</Link></Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ value: "", label: "전체" }, { value: "FILE", label: "파일" }, { value: "LINK", label: "링크" }, { value: "VIDEO", label: "영상" }, { value: "NOTION", label: "노션" }].map((t) => (
          <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm"
            onClick={() => { setTypeFilter(t.value); setPage(1) }}>{t.label}</Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">총 {total}개</p>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>등록된 자료가 없습니다.</p>
          <Button variant="outline" className="mt-4" asChild><Link href="/resources/new">첫 자료 올리기</Link></Button>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{TYPE_ICONS[r.type] ?? <FileText className="h-5 w-5" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      {r.description && <p className="text-sm text-muted-foreground truncate">{r.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[r.type]}</Badge>
                        {parseTags(r.tags).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.uploader.name} · {formatRelative(r.createdAt)}{r.fileSize ? ` · ${formatFileSize(r.fileSize)}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="h-3 w-3" />{r.downloadCount}
                      </span>
                      {(r.url || r.filePath) && (
                        <a
                          href={r.url ?? r.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => fetch(`/api/resources/${r.id}`)}
                          className="text-primary hover:underline text-sm"
                        >
                          열기
                        </a>
                      )}

                      {canEdit(r) && (
                        confirmDeleteId === r.id ? (
                          /* 삭제 확인 인라인 UI */
                          <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/30 rounded px-2 py-0.5">
                            <span className="text-xs text-destructive font-medium">삭제할까요?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deleting}
                              className="text-xs text-destructive font-semibold hover:underline disabled:opacity-50 ml-1"
                            >
                              {deleting ? "..." : "확인"}
                            </button>
                            <span className="text-destructive/40 text-xs">|</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/resources/${r.id}/edit`}
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors border rounded px-2 py-0.5 hover:border-primary"
                            >
                              <Pencil className="h-3 w-3" />수정
                            </Link>
                            <button
                              onClick={() => setConfirmDeleteId(r.id)}
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors border rounded px-2 py-0.5 hover:border-destructive"
                            >
                              <Trash2 className="h-3 w-3" />삭제
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
