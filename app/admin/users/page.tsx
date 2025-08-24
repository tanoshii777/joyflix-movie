"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Activity,
  Calendar,
  Download,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

interface User {
  _id: string
  fullName: string
  username: string
  email: string
  profileImage?: string
  bio?: string
  location?: string
  preferences?: any
  watchlist: string[]
  favorites: string[]
  theme: string
  lastLogin?: string
  loginCount: number
  createdAt: string
  updatedAt: string
  isActive?: boolean
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [sortBy, setSortBy] = useState<"name" | "email" | "created" | "lastLogin">("created")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  })

  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin")
    if (!isAdmin) {
      router.push("/admin/login")
      return
    }
    fetchUsers()
  }, [router, currentPage, filterStatus, sortBy])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        filter: filterStatus,
        sort: sortBy,
        search: searchTerm,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setUserStats(data.stats)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      if (response.ok) {
        toast.success(`User ${action} successfully`)
        fetchUsers()
      } else {
        throw new Error(`Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected")
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      return
    }

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUsers, action }),
      })

      if (response.ok) {
        toast.success(`Bulk ${action} completed successfully`)
        setSelectedUsers([])
        fetchUsers()
      } else {
        throw new Error(`Failed to ${action} users`)
      }
    } catch (error) {
      console.error(`Error bulk ${action}:`, error)
      toast.error(`Failed to ${action} users`)
    }
  }

  const exportUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Users exported successfully")
      }
    } catch (error) {
      console.error("Error exporting users:", error)
      toast.error("Failed to export users")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {userStats.total} Total Users
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportUsers} className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{userStats.inactive}</div>
              <p className="text-xs text-muted-foreground">Suspended/inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userStats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">Recent signups</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Management</CardTitle>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                  <Button size="sm" onClick={() => handleBulkAction("activate")} className="gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction("suspend")} className="gap-1">
                    <Ban className="w-4 h-4" />
                    Suspend
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("delete")} className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-background border border-border rounded-md"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-background border border-border rounded-md"
              >
                <option value="created">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="lastLogin">Sort by Last Login</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers((prev) => [...prev, user._id])
                          } else {
                            setSelectedUsers((prev) => prev.filter((id) => id !== user._id))
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage || "/placeholder.svg"}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">{user.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{user.fullName}</h4>
                          <Badge variant={user.isActive !== false ? "default" : "destructive"}>
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            @{user.username} • {user.email}
                          </p>
                          <p>
                            Joined: {new Date(user.createdAt).toLocaleDateString()} • Last login:{" "}
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                          </p>
                          <p>
                            Watchlist: {user.watchlist.length} • Favorites: {user.favorites.length} • Logins:{" "}
                            {user.loginCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant={user.isActive !== false ? "destructive" : "default"}
                        onClick={() => handleUserAction(user._id, user.isActive !== false ? "suspend" : "activate")}
                        className="gap-1"
                      >
                        {user.isActive !== false ? (
                          <>
                            <Ban className="w-4 h-4" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
