"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventType, setEventType] = useState("STUDY")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const [location, setLocation] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (new Date(startAt) >= new Date(endAt)) { toast.error("종료 시간이 시작 시간보다 이후여야 합니다."); return }
    setLoading(true)
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, eventType, startAt, endAt, isOnline, location: !isOnline ? location : undefined, meetingUrl: isOnline ? meetingUrl : undefined }),
    })
    if (res.ok) {
      toast.success("일정이 등록되었습니다.")
      router.push("/schedule")
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/schedule"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>일정 추가</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>유형</Label>
              <Select value={eventType} onValueChange={(v: string | null) => v && setEventType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDY">스터디</SelectItem>
                  <SelectItem value="SEMINAR">세미나</SelectItem>
                  <SelectItem value="WORKSHOP">워크샵</SelectItem>
                  <SelectItem value="MEETUP">모임</SelectItem>
                  <SelectItem value="PRESENTATION">발표</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작 일시 *</Label>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>종료 일시 *</Label>
                <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
                온라인 진행
              </label>
            </div>
            {isOnline ? (
              <div className="space-y-2">
                <Label>미팅 URL</Label>
                <Input type="url" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>장소</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 본사 3층 세미나실" />
              </div>
            )}
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <Button type="submit" disabled={loading}>{loading ? "등록 중..." : "일정 등록"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
