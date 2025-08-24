"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Save, ArrowLeft, Camera, Lock, Trash2, Shield, Bell, SettingsIcon } from "lucide-react"
import Image from "next/image"
import NavbarWrapper from "../components/NavbarWrapper"
import Footer from "../components/Footer"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserType = {
  id: string
  email: string
  fullName: string
  username: string
  profileImage?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  preferences?: {
    emailNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
    autoplay: boolean
    quality: string
    language: string
  }
  createdAt?: string
  lastLogin?: string
  loginCount?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    autoplay: true,
    quality: "auto",
    language: "en",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [deleteData, setDeleteData] = useState({
    password: "",
    confirmText: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setProfileData({
            fullName: data.user.fullName || "",
            username: data.user.username || "",
            bio: data.user.bio || "",
            location: data.user.location || "",
            website: data.user.website || "",
            socialLinks: data.user.socialLinks || {
              twitter: "",
              instagram: "",
              linkedin: "",
            },
          })
          setPreferences(data.user.preferences || preferences)
        } else {
          router.replace("/login")
        }
      } catch (err) {
        console.error("Profile fetch failed:", err)
        router.replace("/login")
      } finally {
        setAuthChecked(true)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }

      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string

        try {
          const res = await fetch("/api/user/avatar", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileImage: result }),
          })

          const data = await res.json()
          if (res.ok) {
            setUser((prev) => (prev ? { ...prev, profileImage: result } : null))
            toast.success("Profile image updated successfully!")
          } else {
            toast.error(data.error || "Failed to update profile image")
          }
        } catch (error) {
          toast.error("Failed to update profile image")
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSave = async () => {
    if (!profileData.fullName.trim()) {
      toast.error("Full name cannot be empty")
      return
    }

    if (!profileData.username.trim()) {
      toast.error("Username cannot be empty")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      const data = await res.json()
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : null))
        setIsEditing(false)
        toast.success("Profile updated successfully!")
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Preferences updated successfully!")
      } else {
        toast.error(data.error || "Failed to update preferences")
      }
    } catch (error) {
      toast.error("Failed to update preferences")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All password fields are required")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        toast.success("Password updated successfully!")
      } else {
        toast.error(data.error || "Failed to update password")
      }
    } catch (error) {
      toast.error("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDelete = async () => {
    if (!deleteData.password || deleteData.confirmText !== "DELETE MY ACCOUNT") {
      toast.error("Please enter your password and type 'DELETE MY ACCOUNT' to confirm")
      return
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Account deleted successfully")
        localStorage.clear()
        router.push("/register")
      } else {
        toast.error(data.error || "Failed to delete account")
      }
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your profile information and social links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-red-600 flex items-center justify-center">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage || "/placeholder.svg"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user.fullName}</h2>
                    <p className="text-gray-400">@{user.username}</p>
                    <p className="text-sm text-gray-500">
                      Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-700 border-gray-600 min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400">{profileData.bio.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                          }))
                        }
                        disabled={!isEditing}
                        placeholder="@username"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={profileData.socialLinks.instagram}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                          }))
                        }
                        disabled={!isEditing}
                        placeholder="@username"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                          }))
                        }
                        disabled={!isEditing}
                        placeholder="username"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleProfileSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setProfileData({
                            fullName: user.fullName || "",
                            username: user.username || "",
                            bio: user.bio || "",
                            location: user.location || "",
                            website: user.website || "",
                            socialLinks: user.socialLinks || {
                              twitter: "",
                              instagram: "",
                              linkedin: "",
                            },
                          })
                        }}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>Customize your viewing experience and notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive updates about your account via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Get notified about new releases and updates</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-sm text-gray-400">Receive promotional content and special offers</p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={preferences.marketingEmails}
                        onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketingEmails: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Playback Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quality">Default Quality</Label>
                      <Select
                        value={preferences.quality}
                        onValueChange={(value) => setPreferences((prev) => ({ ...prev, quality: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="4k">4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoplay">Autoplay</Label>
                      <p className="text-sm text-gray-400">Automatically play next episode or movie</p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={preferences.autoplay}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoplay: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handlePreferencesSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your password and account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <Button onClick={handlePasswordChange} disabled={loading} className="bg-red-600 hover:bg-red-700">
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Last Login</Label>
                      <p className="text-gray-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div>
                      <Label>Total Logins</Label>
                      <p className="text-gray-400">{user.loginCount || 0} times</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. All your data,
                    including watchlists, favorites, and viewing history will be lost forever.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                      <Input
                        id="deletePassword"
                        type="password"
                        value={deleteData.password}
                        onChange={(e) => setDeleteData((prev) => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmText">Type "DELETE MY ACCOUNT" to confirm</Label>
                      <Input
                        id="confirmText"
                        value={deleteData.confirmText}
                        onChange={(e) => setDeleteData((prev) => ({ ...prev, confirmText: e.target.value }))}
                        placeholder="DELETE MY ACCOUNT"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAccountDelete}
                    disabled={loading || !deleteData.password || deleteData.confirmText !== "DELETE MY ACCOUNT"}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? "Deleting..." : "Delete Account Permanently"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
