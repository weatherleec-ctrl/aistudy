"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function ResourceDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("자료가 삭제되었습니다.")
      router.push("/resources")
    } else {
      toast.error("삭제 중 오류가 발생했습니다.")
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">정말 삭제할까요?</span>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "삭제 중..." : "확인"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
          취소
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirm(true)}
      className="text-destructive hover:text-destructive hover:border-destructive">
      <Trash2 className="h-4 w-4 mr-1" />삭제
    </Button>
  )
}
