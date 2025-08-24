import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protected routes that require user authentication
  const protectedRoutes = ["/", "/movies", "/series", "/search", "/watchlist", "/dashboard", "/watch"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check user authentication for main app routes
  if (isProtectedRoute && !isPublicRoute) {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    } catch (err) {
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url))
      response.cookies.delete("token")
      return response
    }
  }

  if (pathname === "/admin/login") {
    const adminToken = req.cookies.get("admin_token")?.value
    if (adminToken) {
      try {
        await jose.jwtVerify(adminToken, new TextEncoder().encode(process.env.JWT_SECRET!))
        // Admin is already authenticated, redirect to dashboard
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      } catch (err) {
        // Invalid token, allow access to login page
        const response = NextResponse.next()
        response.cookies.delete("admin_token")
        return response
      }
    }
  }

  // Admin routes protection (existing logic)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
      return NextResponse.next()
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
