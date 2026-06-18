"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Video, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

const RSVP_LABELS: Record<string, string> = { ATTENDING: "참석", NOT_ATTENDING: "불참", MAYBE: "미정" }

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [myRsvp, setMyRsvp] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/schedule/${id}`).then(r => r.json()).then(data => {
      setEvent(data)
      if (session?.user?.id) {
        const att = data.attendances?.find((a: any) => a.userId === session.user.id)
        setMyRsvp(att?.status ?? null)
      }
      setLoading(false)
    })
  }, [id, session])

  async function rsvp(status: string) {
    const res = await fetch(`/api/schedule/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setMyRsvp(status)
      toast.success(`${RSVP_LABELS[status]}으로 응답하였습니다.`)
      const updated = await fetch(`/api/schedule/${id}`).then(r => r.json())
      setEvent(updated)
    } else toast.error("오류가 발생했습니다.")
  }

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />
  if (!event || event.error) return <div className="text-center py-16">일정을 찾을 수 없습니다.</div>

  const attendees = event.attendances?.filter((a: any) => a.status === "ATTENDING") ?? []
  const canEdit = session?.user?.id === event.creatorId || session?.user?.role === "ADMIN"

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild><Link href="/schedule"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
        {canEdit && (
          <Button variant="destructive" size="sm" onClick={async () => {
            if (!confirm("일정을 삭제하시겠습니까?")) return
            await fetch(`/api/schedule/${id}`, { method: "DELETE" })
            toast.success("삭제되었습니다.")
            router.push("/schedule")
          }}>삭제</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Badge className="mb-2">{event.eventType}</Badge>
            <h2 className="text-2xl font-bold">{event.title}</h2>
            {event.description && <p className="text-muted-foreground mt-1">{event.description}</p>}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{formatDateTime(event.startAt)} ~ {formatDateTime(event.endAt)}</div>
            {event.isOnline ? (
              <div className="flex items-center gap-2"><Video className="h-4 w-4 text-muted-foreground" />온라인
                {event.meetingUrl && <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">링크 열기</a>}
              </div>
            ) : event.location && (
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{event.location}</div>
            )}
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{attendees.length}명 참석 예정</div>
          </div>
          <p className="text-xs text-muted-foreground">주최: {event.creator?.name}</p>
        </CardContent>
      </Card>

      {/* RSVP */}
      {session?.user && (
        <div className="space-y-2">
          <p className="font-medium">참석 여부</p>
          <div className="flex gap-2">
            {(["ATTENDING", "NOT_ATTENDING", "MAYBE"] as const).map(s => (
              <Button key={s} variant={myRsvp === s ? "default" : "outline"} size="sm" onClick={() => rsvp(s)}>{RSVP_LABELS[s]}</Button>
            ))}
          </div>
          {myRsvp && <p className="text-sm text-muted-foreground">현재: <span className="font-medium">{RSVP_LABELS[myRsvp]}</span></p>}
        </div>
      )}

      {/* 참석자 목록 */}
      {attendees.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">참석자 ({attendees.length}명)</p>
          <div className="flex flex-wrap gap-2">
            {attendees.map((a: any) => (
              <Badge key={a.userId} variant="secondary">{a.user.name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
