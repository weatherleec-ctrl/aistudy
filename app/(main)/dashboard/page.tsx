import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp, FolderOpen, CalendarDays, Users,
  ArrowRight, PlayCircle, Link2, FileText, BookOpen,
  ExternalLink, Globe,
} from "lucide-react"
import Link from "next/link"
import { formatRelative, formatDate, parseTags } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  LLM: "LLM", VISION: "Vision", MULTIMODAL: "Multimodal",
  AGENT: "Agent", TOOLS: "Tools", RESEARCH: "Research",
  INDUSTRY: "Industry", OTHER: "기타",
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  STUDY: "스터디", SEMINAR: "세미나", WORKSHOP: "워크샵",
  MEETUP: "모임", PRESENTATION: "발표", OTHER: "기타",
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function ResourceIcon({ type }: { type: string }) {
  if (type === "VIDEO") return <PlayCircle className="h-5 w-5 text-purple-400 shrink-0" />
  if (type === "LINK") return <Link2 className="h-5 w-5 text-blue-400 shrink-0" />
  if (type === "NOTION") return <BookOpen className="h-5 w-5 text-gray-400 shrink-0" />
  return <FileText className="h-5 w-5 text-orange-400 shrink-0" />
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    trendCount, resourceCount, upcomingEventCount, memberCount,
    recentTrends, recentResources, upcomingEvents, recentMembers, latestRefSite,
  ] = await Promise.all([
    prisma.trend.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.resource.count(),
    prisma.event.count({ where: { startAt: { gte: now } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.trend.findMany({ orderBy: { createdAt: "desc" }, take: 2, include: { author: { select: { name: true } } } }),
    prisma.resource.findMany({ orderBy: { createdAt: "desc" }, take: 2, include: { uploader: { select: { name: true } } } }),
    prisma.event.findMany({ where: { startAt: { gte: now } }, orderBy: { startAt: "asc" }, take: 2 }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { joinedAt: "desc" }, take: 2 }),
    prisma.refSite.findFirst({ orderBy: { createdAt: "desc" }, include: { addedBy: { select: { name: true } } } }),
  ])

  const stats = [
    { label: "이번 주 새 동향", value: trendCount, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", href: "/trends" },
    { label: "등록된 자료", value: resourceCount, icon: FolderOpen, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/resources" },
    { label: "다가오는 일정", value: upcomingEventCount, icon: CalendarDays, color: "text-amber-500", bg: "bg-amber-500/10", href: "/schedule" },
    { label: "활성 멤버", value: memberCount, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10", href: "/members" },
  ]

  return (
    <div className="space-y-6">
      {/* 환영 */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">안녕하세요, {session?.user?.name}님!</h2>
        <p className="text-muted-foreground mt-1 text-sm">AI 학습조직 포털에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 박스 4개 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="rounded-lg border bg-card p-4 flex items-center gap-3 hover:border-primary/50 hover:bg-accent transition-colors">
            <div className={`rounded p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 콘텐츠 4개 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 최근 동향 */}
        <div className="rounded-lg border bg-white dark:bg-card border-border">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-sky-100/50 border-b border-border dark:bg-sky-900/10">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              최근 동향
            </div>
            <Link href="/trends" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              전체보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTrends.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">등록된 동향이 없습니다.</p>
            ) : recentTrends.map((t) => (
              <Link key={t.id} href={`/trends/${t.id}`} className="flex items-start gap-3 p-4 hover:bg-accent transition-colors group">
                <div className="mt-0.5 rounded bg-primary/10 p-1.5 shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">{CATEGORY_LABELS[t.category] ?? t.category}</Badge>
                    <span className="text-xs text-muted-foreground">{t.author.name} · {formatRelative(t.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 자료 */}
        <div className="rounded-lg border bg-white dark:bg-card border-border">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-sky-100/50 border-b border-border dark:bg-sky-900/10">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <FolderOpen className="h-4 w-4 text-emerald-500" />
              최근 자료
            </div>
            <Link href="/resources" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              전체보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentResources.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">등록된 자료가 없습니다.</p>
            ) : recentResources.map((r) => {
              const ytId = r.type === "VIDEO" && r.url ? extractYouTubeId(r.url) : null
              return (
                <Link key={r.id} href={`/resources/${r.id}`} className="flex gap-3 p-4 hover:bg-accent transition-colors group">
                  {/* 썸네일 or 아이콘 */}
                  {ytId ? (
                    <div className="shrink-0 w-20 h-12 rounded overflow-hidden border bg-muted relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="shrink-0 w-20 h-12 rounded border bg-muted flex items-center justify-center">
                      <ResourceIcon type={r.type} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{r.type}</Badge>
                      <span className="text-xs text-muted-foreground">{r.uploader.name} · {formatRelative(r.createdAt)}</span>
                    </div>
                    {r.url && r.type !== "FILE" && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5 flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        {r.url}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 다가오는 일정 */}
        <div className="rounded-lg border bg-white dark:bg-card border-border">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-sky-100/50 border-b border-border dark:bg-sky-900/10">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              다가오는 일정
            </div>
            <Link href="/schedule" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              전체보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingEvents.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">예정된 일정이 없습니다.</p>
            ) : upcomingEvents.map((e) => (
              <Link key={e.id} href={`/schedule/${e.id}`} className="flex items-start gap-3 p-4 hover:bg-accent transition-colors group">
                <div className="mt-0.5 shrink-0 rounded bg-amber-500/10 p-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{e.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">{EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(e.startAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.isOnline ? "🔗 온라인" : `📍 ${e.location ?? "장소 미정"}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 참고 사이트 */}
        <div className="rounded-lg border bg-white dark:bg-card border-border">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-sky-100/50 border-b border-border dark:bg-sky-900/10">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Globe className="h-4 w-4 text-cyan-500" />
              참고 사이트
            </div>
            <Link href="/refsites" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              전체보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div>
            {!latestRefSite ? (
              <p className="p-4 text-sm text-muted-foreground">등록된 참고 사이트가 없습니다.</p>
            ) : (
              <a href={latestRefSite.url} target="_blank" rel="noopener noreferrer"
                className="flex gap-3 p-4 hover:bg-accent transition-colors group">
                {/* 썸네일 */}
                {latestRefSite.imageUrl ? (
                  <div className="shrink-0 w-24 h-16 rounded overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={latestRefSite.imageUrl} alt={latestRefSite.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 w-24 h-16 rounded border bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-cyan-400/60" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{latestRefSite.title}</p>
                  {latestRefSite.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{latestRefSite.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-primary">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{latestRefSite.url}</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* 활성 멤버 */}
        <div className="rounded-lg border bg-white dark:bg-card border-border md:col-span-2">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-sky-100/50 border-b border-border dark:bg-sky-900/10">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users className="h-4 w-4 text-violet-500" />
              활성 멤버
            </div>
            <Link href="/members" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              전체보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {recentMembers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground sm:col-span-2">멤버가 없습니다.</p>
            ) : recentMembers.map((m) => {
              const tags = parseTags(m.expertise ?? "[]")
              return (
                <Link key={m.id} href={`/members/${m.id}`} className="flex items-center gap-3 p-4 hover:bg-accent transition-colors group">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-500">{m.name.slice(0, 1)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{m.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {tags.length === 0 && (
                        <span className="text-xs text-muted-foreground">{m.role === "ADMIN" ? "관리자" : "멤버"}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={m.role === "ADMIN" ? "default" : "secondary"} className="text-xs shrink-0">
                    {m.role === "ADMIN" ? "관리자" : "멤버"}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
