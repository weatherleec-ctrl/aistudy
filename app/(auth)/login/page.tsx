"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Lock } from "lucide-react"

const STORAGE_KEY = "ai_portal_saved_login"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved)
        if (savedEmail) setEmail(savedEmail)
        if (savedPassword) setPassword(savedPassword)
        setRememberMe(true)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.")
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar px-4">
      {/* Background grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.265_0.09_258)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.265_0.09_258)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary shadow-xl shadow-primary/40 mb-5">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI 학습조직 포털</h1>
          <p className="text-sm text-sidebar-foreground/50 mt-1 tracking-widest uppercase">Internal Platform</p>
        </div>

        {/* Card */}
        <div className="bg-sidebar-accent border border-sidebar-border p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-widest">팀원 로그인</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sidebar-foreground/80 text-xs uppercase tracking-widest font-semibold">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@samchully.co.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:ring-primary focus-visible:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sidebar-foreground/80 text-xs uppercase tracking-widest font-semibold">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:ring-primary focus-visible:border-primary"
                required
              />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border border-sidebar-border bg-sidebar peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-sidebar-foreground/60 group-hover:text-sidebar-foreground/90 transition-colors">
                로그인 정보 저장
              </span>
            </label>

            {error && (
              <div className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full font-semibold tracking-wide shadow-lg shadow-primary/30" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-sidebar-foreground/30 mt-6 uppercase tracking-widest">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}
