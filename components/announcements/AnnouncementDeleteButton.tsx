"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function AnnouncementDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("공지사항을 삭제하시겠습니까?")) return
    setLoading(true)
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("삭제되었습니다."); router.push("/announcements") }
    else toast.error("삭제 실패")
    setLoading(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "삭제 중..." : "삭제"}
    </Button>
  )
}
