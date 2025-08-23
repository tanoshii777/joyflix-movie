"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Save, ArrowLeft } from "lucide-react"
import NavbarWrapper from "../components/NavbarWrapper"
import Footer from "../components/Footer"

type UserType = {
  email: string
  username?: string
  createdAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setFormData({
            username: data.user.username || "",
            email: data.user.email || "",
          })
        } else {
          router.replace("/login")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        router.replace("/login")
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  const handleSave = async () => {
    // This would typically make an API call to update user profile
    console.log("Saving profile:", formData)
    setIsEditing(false)
    // For now, just update local state
    setUser((prev) => (prev ? { ...prev, ...formData } : null))
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

      <div className="pt-20 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username || "User"}</h2>
              <p className="text-gray-400">
                Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  placeholder="Enter your username"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
                  {user.username || "Not set"}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">{user.email}</div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "January 2024"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      username: user.username || "",
                      email: user.email || "",
                    })
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
