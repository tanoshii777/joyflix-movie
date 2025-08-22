import { NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(req: Request) {
  try {
    // 🔎 Grab token from cookies
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ Verify token
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Return user info (username + email)
    return NextResponse.json({
      user: {
        email: payload.email,
        username: payload.username ?? "Guest", // 👈 fallback if no username in token
      },
    });
  } catch (err) {
    console.error("Auth check failed:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
