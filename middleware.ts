import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AuthTokens } from "./lib/auth"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protected routes that require user authentication
  const protectedRoutes = ["/", "/movies", "/series", "/search", "/watchlist", "/dashboard", "/watch", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check user authentication for main app routes
  if (isProtectedRoute && !isPublicRoute) {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      await AuthTokens.verifyToken(token)
    } catch (err) {
      // Try to refresh token
      const refreshToken = req.cookies.get("refresh_token")?.value
      if (refreshToken) {
        try {
          await AuthTokens.verifyRefreshToken(refreshToken)
          // Redirect to refresh endpoint
          return NextResponse.redirect(new URL("/api/auth/refresh", req.url))
        } catch (refreshErr) {
          // Both tokens invalid, clear and redirect to login
          const response = NextResponse.redirect(new URL("/login", req.url))
          response.cookies.delete("token")
          response.cookies.delete("refresh_token")
          return response
        }
      } else {
        // No refresh token, clear and redirect to login
        const response = NextResponse.redirect(new URL("/login", req.url))
        response.cookies.delete("token")
        return response
      }
    }
  }

  // Admin authentication handling
  if (pathname === "/admin/login") {
    const adminToken = req.cookies.get("admin_token")?.value
    if (adminToken) {
      try {
        await AuthTokens.verifyToken(adminToken)
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      } catch (err) {
        const response = NextResponse.next()
        response.cookies.delete("admin_token")
        return response
      }
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      const payload = await AuthTokens.verifyToken(token)
      // Check if user has admin role (for enhanced admin system)
      if (!payload.isAdmin && !payload.role?.includes("admin")) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    } catch (err) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url))
      response.cookies.delete("admin_token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
