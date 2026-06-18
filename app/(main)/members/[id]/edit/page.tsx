"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { parseTags } from "@/lib/utils"

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState<string[]>([])
  const [expertiseInput, setExpertiseInput] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [role, setRole] = useState("MEMBER")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then(r => r.json())
      .then(m => {
        setName(m.name ?? "")
        setEmail(m.email ?? "")
        setBio(m.bio ?? "")
        setExpertise(parseTags(m.expertise ?? "[]"))
        setGithubUrl(m.githubUrl ?? "")
        setRole(m.role ?? "MEMBER")
        setIsActive(m.isActive ?? true)
        setInitialLoading(false)
      })
  }, [id])

  function addExpertise() {
    const t = expertiseInput.trim()
    if (t && !expertise.includes(t)) setExpertise([...expertise, t])
    setExpertiseInput("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, bio, expertise: JSON.stringify(expertise), githubUrl, role, isActive }),
    })
    if (res.ok) {
      toast.success("멤버 정보가 수정되었습니다.")
      router.push(`/members/${id}`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? "오류가 발생했습니다.")
    }
    setLoading(false)
  }

  if (initialLoading) return <div className="animate-pulse h-40 bg-muted rounded" />

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild><Link href={`/members/${id}`}><ArrowLeft className="h-4 w-4 mr-1" />멤버 프로필</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>멤버 정보 수정</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>이름 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>이메일 *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>자기소개</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
            <div className="space-y-2">
              <Label>전문 분야</Label>
              <div className="flex gap-2">
                <Input value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} placeholder="예: LLM, RAG, Vision" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExpertise() } }} />
                <Button type="button" variant="outline" onClick={addExpertise}>추가</Button>
              </div>
              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {expertise.map(t => (
                    <Badge key={t} variant="secondary" className="gap-1">{t}<button type="button" onClick={() => setExpertise(expertise.filter(e => e !== t))}><X className="h-3 w-3" /></button></Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2"><Label>GitHub URL</Label><Input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." /></div>
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                활성 계정
              </label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "저장 중..." : "저장"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
