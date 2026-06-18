import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 인증 불필요 경로는 통과
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token")

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}
