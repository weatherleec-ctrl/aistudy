"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { parseTags } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Plus } from "lucide-react"

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    fetch("/api/members").then(r => r.json()).then(data => { setMembers(data); setLoading(false) })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">총 {members.length}명의 멤버</p>
        {session?.user.role === "ADMIN" && (
          <Button asChild size="sm"><Link href="/members/new"><Plus className="h-4 w-4 mr-1" />멤버 추가</Link></Button>
        )}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map(m => (
            <Link key={m.id} href={`/members/${m.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="rounded-full" /> : <AvatarFallback className="text-lg">{m.name.slice(0, 1)}</AvatarFallback>}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.name}</span>
                      {m.role === "ADMIN" && <Badge variant="default" className="text-xs">운영진</Badge>}
                    </div>
                    {m.bio && <p className="text-sm text-muted-foreground truncate mt-0.5">{m.bio}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parseTags(m.expertise ?? "[]").slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(m.joinedAt), "yyyy년 MM월 가입", { locale: ko })}</p>
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
