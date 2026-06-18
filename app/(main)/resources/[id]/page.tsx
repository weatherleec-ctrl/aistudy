import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Download, FileText, Link2, Video, BookOpen, Calendar, User } from "lucide-react"
import Link from "next/link"
import { formatDateTime, parseTags, formatFileSize } from "@/lib/utils"
import { ResourceDeleteButton } from "@/components/resources/ResourceDeleteButton"

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  FILE:   { label: "파일",  icon: <FileText className="h-4 w-4" />, color: "text-blue-500" },
  LINK:   { label: "링크",  icon: <Link2    className="h-4 w-4" />, color: "text-green-500" },
  VIDEO:  { label: "영상",  icon: <Video    className="h-4 w-4" />, color: "text-red-500" },
  NOTION: { label: "노션",  icon: <BookOpen className="h-4 w-4" />, color: "text-gray-500" },
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true } } },
  })
  if (!resource) notFound()

  const canEdit = session?.user?.id === resource.uploader.id || session?.user?.role === "ADMIN"
  const typeConfig = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.FILE
  const tags = parseTags(resource.tags ?? "[]")
  const ytId = resource.type === "VIDEO" && resource.url ? extractYouTubeId(resource.url) : null

  return (
    <div className="max-w-3xl space-y-6">
      {/* 뒤로 가기 */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/resources"><ArrowLeft className="h-4 w-4 mr-1" />자료 목록</Link>
      </Button>

      {/* 메인 카드 */}
      <div className="rounded-lg border bg-card">
        {/* 헤더 */}
        <div className="p-6 border-b space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={typeConfig.color}>{typeConfig.icon}</span>
                <Badge variant="outline" className="text-xs">{typeConfig.label}</Badge>
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-xl font-bold leading-snug">{resource.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />{resource.uploader.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />{formatDateTime(resource.createdAt)}
            </span>
            {resource.fileSize && (
              <span>{formatFileSize(resource.fileSize)}</span>
            )}
          </div>

          {resource.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
          )}
        </div>

        {/* 본문 — YouTube 임베드 */}
        {ytId && (
          <div className="p-6 border-b">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded"
                src={`https://www.youtube.com/embed/${ytId}`}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* 열기 / 다운로드 버튼 */}
        {(resource.url || resource.filePath) && (
          <div className="p-6 border-b">
            {resource.type === "FILE" ? (
              <a
                href={resource.filePath ?? resource.url ?? "#"}
                download={resource.fileName ?? undefined}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                <Download className="h-4 w-4" />
                {resource.fileName ? `${resource.fileName} 다운로드` : "파일 다운로드"}
              </a>
            ) : (
              <a
                href={resource.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                {resource.type === "NOTION" ? "노션에서 열기" :
                 resource.type === "VIDEO" ? "원본 영상 열기" : "링크 열기"}
              </a>
            )}
          </div>
        )}

        {/* 관리자/작성자 액션 */}
        {canEdit && (
          <div className="p-4 flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/resources/${id}/edit`}>수정</Link>
            </Button>
            <ResourceDeleteButton id={id} />
          </div>
        )}
      </div>
    </div>
  )
}
