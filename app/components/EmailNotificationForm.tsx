"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, Check } from "lucide-react"
import { toast } from "sonner"

interface EmailNotificationFormProps {
  request: any
  onNotificationSent?: () => void
}

export default function EmailNotificationForm({ request, onNotificationSent }: EmailNotificationFormProps) {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [notificationType, setNotificationType] = useState<"approved" | "available">("approved")

  const sendNotification = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: notificationType,
          request: request,
          userEmail: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Notification sent successfully!", {
          description: `Email sent to ${email}`,
        })
        setEmail("")
        onNotificationSent?.()
      } else {
        toast.error("Failed to send notification", {
          description: data.error || "Unknown error occurred",
        })
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Failed to send notification", {
        description: "Network error occurred",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Send Email Notification</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-slate-300">
            User Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        <div>
          <Label className="text-slate-300">Notification Type</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={notificationType === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setNotificationType("approved")}
              className={notificationType === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Check className="w-4 h-4 mr-1" />
              Approved
            </Button>
            <Button
              variant={notificationType === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setNotificationType("available")}
              className={notificationType === "available" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Send className="w-4 h-4 mr-1" />
              Available
            </Button>
          </div>
        </div>

        <Button
          onClick={sendNotification}
          disabled={sending || !email.trim()}
          className="w-full bg-rose-600 hover:bg-rose-700"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send {notificationType === "approved" ? "Approval" : "Available"} Notification
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-slate-700 rounded border-l-4 border-blue-500">
        <p className="text-sm text-slate-300">
          <strong>Preview:</strong> This will send a{" "}
          <span className="text-blue-400">
            {notificationType === "approved" ? "movie approved" : "movie available"}
          </span>{" "}
          notification for "{request.title}" ({request.year})
        </p>
      </div>
    </div>
  )
}
