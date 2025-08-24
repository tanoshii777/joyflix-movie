"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Lock, User, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!identifier.trim()) {
      setError("Email or username is required")
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || "Too many login attempts. Please try again later.")
          toast.error("Account temporarily locked due to multiple failed attempts")
        } else if (res.status === 401) {
          setError(data.error || "Invalid credentials")
          toast.error("Login failed - please check your credentials")
        } else {
          setError(data.error || "Login failed")
          toast.error("Login failed")
        }
        return
      }

      setSuccess(data.message || "Login successful!")
      toast.success(data.message || "Welcome back!")

      localStorage.setItem("auth", "true")
      localStorage.setItem("user", JSON.stringify(data.user))

      if (data.user.theme) {
        localStorage.setItem("theme", data.user.theme)
      }

      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please check your connection and try again.")
      toast.error("Connection failed - please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-3 tracking-tight">JoyFlix</h1>
          <p className="text-muted-foreground text-base">Welcome back to your favorite streaming platform</p>
        </div>

        <Card className="auth-card shadow-2xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center text-foreground">Sign In</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/50 bg-green-500/10 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500 font-medium">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-foreground font-medium flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  Email or Username
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  className="input-focus bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary h-12"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-focus bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary h-12 pr-12"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border/50 bg-input/50 text-primary focus:ring-primary focus:ring-offset-0"
                    disabled={loading}
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="button-hover w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Redirecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-base text-muted-foreground">
              New to JoyFlix?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Create an account
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
