"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewMemberPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("MEMBER")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role }),
    })
    if (res.ok) {
      toast.success("멤버가 추가되었습니다.")
      router.push("/members")
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/members"><ArrowLeft className="h-4 w-4 mr-1" />멤버 목록</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>멤버 추가</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>이름 *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required />
            </div>
            <div className="space-y-2">
              <Label>이메일 *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@samchully.co.kr" required />
            </div>
            <div className="space-y-2">
              <Label>초기 비밀번호 *</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8자 이상" minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label>역할</Label>
              <div className="flex gap-3">
                {[{ value: "MEMBER", label: "일반 멤버" }, { value: "ADMIN", label: "관리자" }].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="role" value={opt.value} checked={role === opt.value} onChange={() => setRole(opt.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "추가 중..." : "멤버 추가"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
