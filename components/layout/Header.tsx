"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/dashboard": "대시보드",
  "/trends": "AI 신기술 동향",
  "/resources": "자료 공유",
  "/schedule": "일정 관리",
  "/announcements": "공지사항",
  "/tools": "AI 도구 모음",
  "/refsites": "참고 사이트",
  "/members": "멤버 소개",
  "/profile": "내 프로필",
}

function getTitle(pathname: string) {
  for (const [key, value] of Object.entries(pageTitles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return value
  }
  return "AI 학습조직 포털"
}

export function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur px-6 gap-4">
      <div className="w-0.5 h-6 bg-primary rounded-full shrink-0" />
      <h1 className="text-lg font-bold tracking-tight">{getTitle(pathname)}</h1>
    </header>
  )
}
