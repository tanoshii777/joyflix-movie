"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email.trim()) {
      setError("Email address is required")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send reset email")
        toast.error(data.error || "Failed to send reset email")
        return
      }

      setSuccess(true)
      toast.success("Password reset instructions sent!")

      // Show reset token in development
      if (data.resetToken && process.env.NODE_ENV === "development") {
        console.log("Reset token:", data.resetToken)
        toast.info(`Development: Reset token is ${data.resetToken}`)
      }
    } catch (err) {
      console.error("Forgot password error:", err)
      setError("Network error. Please check your connection and try again.")
      toast.error("Connection failed - please try again")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
        <Card className="auth-card shadow-2xl border-0 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or</p>
              <button onClick={() => setSuccess(false)} className="text-primary hover:text-primary/80 font-medium">
                try again
              </button>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
          <p className="text-muted-foreground text-base">Reset your password</p>
        </div>

        <Card className="auth-card shadow-2xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center text-foreground">Forgot Password</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-base">
              Enter your email address and we'll send you a link to reset your password
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

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-focus bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary h-12"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="button-hover w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>

              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
