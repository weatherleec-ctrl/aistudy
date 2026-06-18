import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Globe, Calendar, User } from "lucide-react"
import Link from "next/link"
import { formatDateTime, parseTags } from "@/lib/utils"
import { RefSiteDeleteButton } from "@/components/refsites/RefSiteDeleteButton"

const CAT_LABELS: Record<string, string> = {
  AI: "AI", DEV: "개발", RESEARCH: "연구/논문",
  DATASET: "데이터셋", COMMUNITY: "커뮤니티", NEWS: "뉴스", OTHER: "기타",
}

export default async function RefSiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const site = await prisma.refSite.findUnique({
    where: { id },
    include: { addedBy: { select: { id: true, name: true } } },
  })
  if (!site) notFound()

  const canEdit = session?.user?.id === site.addedBy.id || session?.user?.role === "ADMIN"
  const tags = parseTags(site.tags ?? "[]")

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/refsites"><ArrowLeft className="h-4 w-4 mr-1" />참고 사이트 목록</Link>
      </Button>

      <div className="rounded-lg border bg-card overflow-hidden">
        {/* 썸네일 */}
        {site.imageUrl ? (
          <div className="h-56 bg-muted overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.imageUrl} alt={site.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Globe className="h-16 w-16 text-primary/20" />
          </div>
        )}

        {/* 정보 */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{CAT_LABELS[site.category] ?? site.category}</Badge>
                {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
              <h1 className="text-2xl font-bold">{site.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{site.addedBy.name}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDateTime(site.createdAt)}</span>
          </div>

          {site.description && (
            <p className="text-muted-foreground leading-relaxed">{site.description}</p>
          )}

          <div className="pt-2 border-t flex items-center justify-between">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />사이트 열기
            </a>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{site.url}</p>
          </div>

          {canEdit && (
            <div className="pt-2 border-t flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/refsites/${id}/edit`}>수정</Link>
              </Button>
              <RefSiteDeleteButton id={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
