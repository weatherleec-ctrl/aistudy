"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pin, PinOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  isPinned: boolean
}

export function AnnouncementPinButton({ id, isPinned }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pinned, setPinned] = useState(isPinned)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const next = !pinned
    const res = await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: next }),
    })
    if (res.ok) {
      setPinned(next)
      toast.success(next ? "공지를 고정했습니다." : "고정을 해제했습니다.")
      router.refresh()
    } else {
      toast.error("처리 중 오류가 발생했습니다.")
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={pinned ? "고정 해제" : "상단 고정"}
      className={cn(
        "shrink-0 p-1.5 rounded transition-colors disabled:opacity-50",
        pinned
          ? "text-primary hover:text-primary/70 hover:bg-primary/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      {pinned
        ? <Pin className="h-4 w-4 fill-primary" />
        : <PinOff className="h-4 w-4" />
      }
    </button>
  )
}
