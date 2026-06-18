import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, GitBranch, Mail } from "lucide-react"
import Link from "next/link"
import { formatDate, parseTags } from "@/lib/utils"

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const member = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, expertise: true, githubUrl: true, joinedAt: true },
  })
  if (!member) notFound()

  const [trendCount, resourceCount] = await Promise.all([
    prisma.trend.count({ where: { authorId: id } }),
    prisma.resource.count({ where: { uploaderId: id } }),
  ])

  const isOwn = session?.user.id === id

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild><Link href="/members"><ArrowLeft className="h-4 w-4 mr-1" />멤버 목록</Link></Button>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="rounded-full" /> : <AvatarFallback className="text-2xl">{member.name.slice(0, 1)}</AvatarFallback>}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{member.name}</h2>
                {member.role === "ADMIN" && <Badge>운영진</Badge>}
              </div>
              {member.bio && <p className="text-muted-foreground mt-1">{member.bio}</p>}
              <p className="text-sm text-muted-foreground">{formatDate(member.joinedAt)} 가입</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {parseTags(member.expertise ?? "[]").map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="flex gap-4 text-sm">
            {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="h-4 w-4" />{member.email}</a>}
            {member.githubUrl && <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><GitBranch className="h-4 w-4" />GitHub</a>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center"><p className="text-2xl font-bold">{trendCount}</p><p className="text-sm text-muted-foreground">작성한 동향</p></div>
            <div className="text-center"><p className="text-2xl font-bold">{resourceCount}</p><p className="text-sm text-muted-foreground">공유한 자료</p></div>
          </div>
        </CardContent>
      </Card>

      {(isOwn || session?.user.role === "ADMIN") && (
        <Button asChild>
          <Link href={isOwn ? "/profile" : `/members/${member.id}/edit`}>
            프로필 수정
          </Link>
        </Button>
      )}
    </div>
  )
}
