import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Plus } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { AnnouncementPinButton } from "@/components/announcements/AnnouncementPinButton"

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === "ADMIN"
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">총 {announcements.length}개의 공지사항</p>
        {isAdmin && (
          <Button asChild size="sm"><Link href="/announcements/new"><Plus className="h-4 w-4 mr-1" />공지 작성</Link></Button>
        )}
      </div>

      <div className="space-y-2">
        {announcements.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">공지사항이 없습니다.</div>
        ) : announcements.map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded-lg border hover:bg-accent transition-colors">
            <Link href={`/announcements/${a.id}`} className="flex items-start gap-3 flex-1 min-w-0 p-4">
              {a.isPinned && <Pin className="h-4 w-4 text-primary mt-0.5 shrink-0 fill-primary" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {a.isImportant && <Badge variant="destructive" className="text-xs">중요</Badge>}
                  <span className="font-medium truncate">{a.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{a.author.name} · {formatDate(a.createdAt)}</p>
              </div>
            </Link>
            {isAdmin && (
              <div className="pr-3 shrink-0">
                <AnnouncementPinButton id={a.id} isPinned={a.isPinned} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
