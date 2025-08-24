"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Mail, Smartphone, Clock } from "lucide-react"
import { toast } from "sonner"

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences")
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
      toast.error("Failed to load notification preferences")
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        toast.success("Notification preferences saved!")
      } else {
        toast.error("Failed to save preferences")
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (category: string, type: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }))
  }

  if (loading) {
    return <div className="animate-pulse">Loading preferences...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which email notifications you'd like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-movie-requests">Movie request updates</Label>
            <Switch
              id="email-movie-requests"
              checked={preferences?.email?.movieRequests || false}
              onCheckedChange={(checked) => updatePreference("email", "movieRequests", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-movie-available">Movie available notifications</Label>
            <Switch
              id="email-movie-available"
              checked={preferences?.email?.movieAvailable || false}
              onCheckedChange={(checked) => updatePreference("email", "movieAvailable", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-system">System updates</Label>
            <Switch
              id="email-system"
              checked={preferences?.email?.systemUpdates || false}
              onCheckedChange={(checked) => updatePreference("email", "systemUpdates", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-weekly">Weekly digest</Label>
            <Switch
              id="email-weekly"
              checked={preferences?.email?.weeklyDigest || false}
              onCheckedChange={(checked) => updatePreference("email", "weeklyDigest", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Get instant notifications on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-movie-requests">Movie request updates</Label>
            <Switch
              id="push-movie-requests"
              checked={preferences?.push?.movieRequests || false}
              onCheckedChange={(checked) => updatePreference("push", "movieRequests", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-movie-available">Movie available notifications</Label>
            <Switch
              id="push-movie-available"
              checked={preferences?.push?.movieAvailable || false}
              onCheckedChange={(checked) => updatePreference("push", "movieAvailable", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-admin">Admin messages</Label>
            <Switch
              id="push-admin"
              checked={preferences?.push?.adminMessages || false}
              onCheckedChange={(checked) => updatePreference("push", "adminMessages", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Control notifications shown within the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-movie-requests">Movie request updates</Label>
            <Switch
              id="inapp-movie-requests"
              checked={preferences?.inApp?.movieRequests || false}
              onCheckedChange={(checked) => updatePreference("inApp", "movieRequests", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-movie-available">Movie available notifications</Label>
            <Switch
              id="inapp-movie-available"
              checked={preferences?.inApp?.movieAvailable || false}
              onCheckedChange={(checked) => updatePreference("inApp", "movieAvailable", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-system">System updates</Label>
            <Switch
              id="inapp-system"
              checked={preferences?.inApp?.systemUpdates || false}
              onCheckedChange={(checked) => updatePreference("inApp", "systemUpdates", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>Set times when you don't want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-enabled">Enable quiet hours</Label>
            <Switch
              id="quiet-hours-enabled"
              checked={preferences?.quietHours?.enabled || false}
              onCheckedChange={(checked) => updatePreference("quietHours", "enabled", checked)}
            />
          </div>
          {preferences?.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start">Start time</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={preferences?.quietHours?.startTime || "22:00"}
                  onChange={(e) => updatePreference("quietHours", "startTime", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">End time</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={preferences?.quietHours?.endTime || "08:00"}
                  onChange={(e) => updatePreference("quietHours", "endTime", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={savePreferences} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  )
}
