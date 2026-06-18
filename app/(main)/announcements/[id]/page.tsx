import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pin } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { AnnouncementDeleteButton } from "@/components/announcements/AnnouncementDeleteButton"
import { AnnouncementPinButton } from "@/components/announcements/AnnouncementPinButton"

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const a = await prisma.announcement.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  })
  if (!a) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild><Link href="/announcements"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {a.isPinned && <Pin className="h-4 w-4 text-primary" />}
            {a.isImportant && <Badge variant="destructive">중요</Badge>}
          </div>
          <h2 className="text-2xl font-bold">{a.title}</h2>
          <p className="text-sm text-muted-foreground">{a.author.name} · {formatDateTime(a.createdAt)}</p>
        </div>
        <hr />
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{a.content}</ReactMarkdown>
        </div>
      </div>

      {session?.user.role === "ADMIN" && (
        <div className="flex gap-2 items-center">
          <AnnouncementPinButton id={a.id} isPinned={a.isPinned} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/announcements/new?edit=${a.id}`}>수정</Link>
          </Button>
          <AnnouncementDeleteButton id={a.id} />
        </div>
      )}
    </div>
  )
}
