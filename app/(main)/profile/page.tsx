"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"
import { parseTags } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState<string[]>([])
  const [expertiseInput, setExpertiseInput] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/members/${session.user.id}`)
        .then(r => r.json())
        .then(m => {
          setName(m.name ?? "")
          setBio(m.bio ?? "")
          setExpertise(parseTags(m.expertise ?? "[]"))
          setGithubUrl(m.githubUrl ?? "")
          setInitialLoading(false)
        })
    }
  }, [session?.user?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user?.id) return
    setLoading(true)
    const res = await fetch(`/api/members/${session.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, expertise: JSON.stringify(expertise), githubUrl }),
    })
    if (res.ok) {
      await update({ name })
      toast.success("프로필이 업데이트되었습니다.")
    } else toast.error("오류가 발생했습니다.")
    setLoading(false)
  }

  function addExpertise() {
    const t = expertiseInput.trim()
    if (t && !expertise.includes(t)) setExpertise([...expertise, t])
    setExpertiseInput("")
  }

  if (initialLoading) return <div className="animate-pulse h-40 bg-muted rounded" />

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader><CardTitle>내 프로필 수정</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>이름 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
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
            <Button type="submit" disabled={loading}>{loading ? "저장 중..." : "저장"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
