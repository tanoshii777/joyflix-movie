import * as jose from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface UserPayload {
  id: string
  username: string
  email: string
  fullName: string
  role?: string
  loginTime: number
}

export interface AdminPayload {
  id: string
  username: string
  email: string
  role: "admin" | "super_admin"
  permissions: string[]
  loginTime: number
}

// JWT Token Management
export class AuthTokens {
  static async createUserToken(payload: UserPayload, rememberMe = false): Promise<string> {
    const expiresIn = rememberMe ? "30d" : "7d"
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET)
  }

  static async createAdminToken(payload: AdminPayload): Promise<string> {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)
  }

  static async createRefreshToken(userId: string): Promise<string> {
    return await new jose.SignJWT({ userId, type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET)
  }

  static async verifyToken(token: string): Promise<jose.JWTPayload> {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload
  }

  static async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    if (payload.type !== "refresh") {
      throw new Error("Invalid refresh token")
    }
    return { userId: payload.userId as string }
  }
}

// Password utilities
export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  static validateStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) errors.push("Password must be at least 8 characters long")
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
    if (!/\d/.test(password)) errors.push("Password must contain at least one number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character")

    return { isValid: errors.length === 0, errors }
  }

  static generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

// Rate limiting
export class RateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>()

  static checkLimit(
    identifier: string,
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000,
  ): { allowed: boolean; remainingTime?: number } {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return { allowed: true }
    }

    // Check if still locked
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      return { allowed: false, remainingTime: Math.ceil((attempt.lockedUntil - now) / 60000) }
    }

    // Reset if window expired
    if (now - attempt.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return { allowed: true }
    }

    // Increment attempts
    attempt.count++
    attempt.lastAttempt = now

    if (attempt.count >= maxAttempts) {
      attempt.lockedUntil = now + windowMs
      return { allowed: false, remainingTime: Math.ceil(windowMs / 60000) }
    }

    return { allowed: true }
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Session management
export class SessionManager {
  static setAuthCookies(response: Response, token: string, refreshToken: string, rememberMe = false) {
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge,
    }

    // Set in headers for Next.js API routes
    const headers = response.headers
    headers.set(
      "Set-Cookie",
      [
        `token=${token}; ${Object.entries(cookieOptions)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")}`,
        `refresh_token=${refreshToken}; ${Object.entries(cookieOptions)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")}`,
      ].join(", "),
    )
  }

  static clearAuthCookies(response: Response) {
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    }

    const headers = response.headers
    headers.set(
      "Set-Cookie",
      [
        `token=; ${Object.entries(clearOptions)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")}`,
        `refresh_token=; ${Object.entries(clearOptions)
          .map(([k, v]) => `${k}=${v}`)
          .join("; ")}`,
      ].join(", "),
    )
  }
}
