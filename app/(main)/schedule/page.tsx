"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronLeft, ChevronRight, MapPin, Video, Users } from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns"
import { ko } from "date-fns/locale"

const EVENT_TYPE_LABELS: Record<string, string> = {
  STUDY: "스터디", SEMINAR: "세미나", WORKSHOP: "워크샵",
  MEETUP: "모임", PRESENTATION: "발표", OTHER: "기타",
}
const EVENT_TYPE_COLORS: Record<string, string> = {
  STUDY: "bg-blue-500", SEMINAR: "bg-purple-500", WORKSHOP: "bg-orange-500",
  MEETUP: "bg-green-500", PRESENTATION: "bg-red-500", OTHER: "bg-gray-500",
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    fetch(`/api/schedule?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false) })
  }, [currentMonth])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfWeek = startOfMonth(currentMonth).getDay()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold min-w-32 text-center">{format(currentMonth, "yyyy년 MM월", { locale: ko })}</h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button asChild><Link href="/schedule/new"><Plus className="h-4 w-4 mr-1" />일정 추가</Link></Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {["일", "월", "화", "수", "목", "금", "토"].map(d => (
            <div key={d} className="p-2 text-center text-sm font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="border-t p-1 min-h-16 bg-muted/30" />)}
          {days.map(day => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.startAt), day))
            return (
              <div key={day.toISOString()} className={`border-t p-1 min-h-16 ${isToday(day) ? "bg-primary/5" : ""}`}>
                <p className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : ""}`}>
                  {format(day, "d")}
                </p>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 2).map(e => (
                    <Link key={e.id} href={`/schedule/${e.id}`} className={`block text-xs px-1 rounded text-white truncate ${EVENT_TYPE_COLORS[e.eventType] ?? "bg-gray-500"}`}>
                      {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && <p className="text-xs text-muted-foreground">+{dayEvents.length - 2}개</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 이번 달 일정 목록 */}
      <h3 className="font-semibold">이번 달 일정</h3>
      {loading ? <div className="animate-pulse h-20 bg-muted rounded" /> : events.length === 0 ? (
        <p className="text-muted-foreground text-sm">이번 달 일정이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {events.map(e => (
            <Link key={e.id} href={`/schedule/${e.id}`}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-1 self-stretch rounded-full shrink-0 ${EVENT_TYPE_COLORS[e.eventType] ?? "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{e.title}</span>
                      <Badge variant="outline" className="text-xs">{EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{format(new Date(e.startAt), "MM월 dd일 HH:mm", { locale: ko })} ~ {format(new Date(e.endAt), "HH:mm")}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {e.isOnline ? <span className="flex items-center gap-1"><Video className="h-3 w-3" />온라인</span> : e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e.attendances?.filter((a: any) => a.status === "ATTENDING").length ?? 0}명 참석</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
