"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  TrendingUp,
  FolderOpen,
  CalendarDays,
  Megaphone,
  Wrench,
  Users,
  Brain,
  LogOut,
  User,
  ChevronRight,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/trends", label: "AI 신기술 동향", icon: TrendingUp },
  { href: "/resources", label: "자료 공유", icon: FolderOpen },
  { href: "/schedule", label: "일정 관리", icon: CalendarDays },
  { href: "/announcements", label: "공지사항", icon: Megaphone },
  { href: "/tools", label: "AI 도구 모음", icon: Wrench },
  { href: "/refsites", label: "참고 사이트", icon: Globe },
  { href: "/members", label: "멤버 소개", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary shadow-lg shadow-primary/30">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white tracking-wide leading-tight">AI 학습조직</span>
          <span className="text-xs text-sidebar-foreground/50 tracking-widest uppercase">Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white shadow-md shadow-primary/25 rounded"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform", active && "scale-110")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded transition-colors"
        >
          <Avatar className="h-6 w-6 ring-1 ring-sidebar-border">
            <AvatarFallback className="text-xs bg-primary/20 text-primary-foreground">
              {session?.user?.name?.slice(0, 1) ?? <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="truncate flex-1">{session?.user?.name ?? "내 프로필"}</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
