import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import { formatDateTime, parseTags } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { TrendComments } from "@/components/trends/TrendComments"

const CATEGORY_LABELS: Record<string, string> = {
  LLM: "대형 언어 모델", VISION: "비전/이미지", MULTIMODAL: "멀티모달",
  AGENT: "AI 에이전트", TOOLS: "개발 도구", RESEARCH: "연구/논문",
  INDUSTRY: "산업 동향", OTHER: "기타",
}

export default async function TrendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const trend = await prisma.trend.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
    },
  })
  if (!trend) notFound()
  await prisma.trend.update({ where: { id }, data: { viewCount: { increment: 1 } } })

  const tags = parseTags(trend.tags)
  const canEdit = session?.user.id === trend.authorId || session?.user.role === "ADMIN"

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild><Link href="/trends"><ArrowLeft className="h-4 w-4 mr-1" />목록</Link></Button>
        {canEdit && <Button variant="outline" size="sm" asChild><Link href={`/trends/new?edit=${id}`}>수정</Link></Button>}
      </div>

      <article className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{CATEGORY_LABELS[trend.category] ?? trend.category}</Badge>
            {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
          </div>
          <h2 className="text-2xl font-bold">{trend.title}</h2>
          <p className="text-muted-foreground">{trend.summary}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{trend.author.name}</span>
            <span>{formatDateTime(trend.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{trend.viewCount}</span>
          </div>
          {trend.sourceUrl && (
            <a href={trend.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ExternalLink className="h-3 w-3" />출처 보기
            </a>
          )}
        </div>
        <hr />
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{trend.content}</ReactMarkdown>
        </div>
      </article>

      <TrendComments trendId={id} initialComments={trend.comments} currentUserId={session?.user.id} isAdmin={session?.user.role === "ADMIN"} />
    </div>
  )
}
