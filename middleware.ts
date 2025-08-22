import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export default async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Define public routes
  const publicPaths = ["/login", "/register"];

  // If user tries to access login/register while already logged in → redirect home
  if (publicPaths.includes(req.nextUrl.pathname)) {
    if (token) {
      try {
        await jose.jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        return NextResponse.redirect(new URL("/", req.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protect private routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    // Run middleware only on actual app pages, not API or static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|json)).*)",
  ],
};
