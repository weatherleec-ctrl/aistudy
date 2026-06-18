"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Trash2 } from "lucide-react"
import { formatRelative } from "@/lib/utils"
import { toast } from "sonner"

type Comment = { id: string; content: string; createdAt: string | Date; author: { id: string; name: string } }

export function TrendComments({ trendId, initialComments, currentUserId, isAdmin }: {
  trendId: string; initialComments: Comment[]; currentUserId?: string; isAdmin?: boolean
}) {
  const [comments, setComments] = useState(initialComments)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function addComment() {
    if (!input.trim()) return
    setLoading(true)
    const res = await fetch(`/api/trends/${trendId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    })
    if (res.ok) {
      const c = await res.json()
      setComments([...comments, c])
      setInput("")
    } else toast.error("댓글 등록 실패")
    setLoading(false)
  }

  async function deleteComment(commentId: string) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    const res = await fetch(`/api/trends/${trendId}/comments?commentId=${commentId}`, { method: "DELETE" })
    if (res.ok) setComments(comments.filter(c => c.id !== commentId))
    else toast.error("삭제 실패")
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" />댓글 {comments.length}개</h3>
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{c.author.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.author.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                  {(currentUserId === c.author.id || isAdmin) && (
                    <button onClick={() => deleteComment(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>}
      </div>
      {currentUserId && (
        <div className="space-y-2 pt-2 border-t">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="댓글을 입력하세요..." rows={2} />
          <Button size="sm" onClick={addComment} disabled={loading}>{loading ? "등록 중..." : "댓글 등록"}</Button>
        </div>
      )}
    </div>
  )
}
