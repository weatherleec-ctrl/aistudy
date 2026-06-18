import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI 학습조직 포털",
  description: "사내 AI 학습조직 전용 포털",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full`}>
      <body className="h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  )
}
