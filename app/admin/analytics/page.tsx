"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Activity, Download, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  userGrowth: any[]
  requestStats: any[]
  topUsers: any[]
  systemHealth: any
  popularMovies: any[]
  period: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin")
    if (!isAdmin) {
      router.push("/admin/login")
      return
    }
    fetchAnalytics()
  }, [router, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        throw new Error("Failed to fetch analytics")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?period=${period}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Report exported successfully")
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      toast.error("Failed to export report")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Last {period} days
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport} className="gap-2 bg-transparent">
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
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.systemHealth.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{data?.systemHealth.activeUsers} active in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movie Requests</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.systemHealth.totalRequests}</div>
              <p className="text-xs text-muted-foreground">{data?.systemHealth.pendingRequests} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.systemHealth.totalNotifications}</div>
              <p className="text-xs text-muted-foreground">{data?.systemHealth.unreadNotifications} unread</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.userGrowth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">
                          {item._id.year}-{String(item._id.month).padStart(2, "0")}-
                          {String(item._id.day).padStart(2, "0")}
                        </span>
                        <Badge variant="secondary">{item.count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Request Distribution</CardTitle>
                  <CardDescription>Movie requests by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.requestStats.map((stat) => (
                      <div key={stat._id} className="flex items-center justify-between">
                        <span className="capitalize">{stat._id}</span>
                        <Badge
                          variant={
                            stat._id === "pending" ? "secondary" : stat._id === "approved" ? "default" : "outline"
                          }
                        >
                          {stat.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Active Users</CardTitle>
                <CardDescription>Users with highest activity scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.topUsers.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{user.totalActivity} points</p>
                        <p className="text-xs text-muted-foreground">
                          {user.loginCount} logins • {user.watchlistCount} watchlist • {user.favoritesCount} favorites
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Movies</CardTitle>
                <CardDescription>Most requested movies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.popularMovies.map((movie, index) => (
                    <div
                      key={movie._id.movieId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{movie._id.title}</p>
                          <p className="text-sm text-muted-foreground">Movie ID: {movie._id.movieId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{movie.requestCount} requests</p>
                        <div className="flex gap-1 mt-1">
                          {movie.statuses.includes("downloaded") && (
                            <Badge variant="default" className="text-xs">
                              Available
                            </Badge>
                          )}
                          {movie.statuses.includes("pending") && (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Response Time</span>
                      <Badge variant="default">120ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uptime</span>
                      <Badge variant="default">99.9%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Error Rate</span>
                      <Badge variant="outline">0.1%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Connections</span>
                      <Badge variant="secondary">1,247</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>Server resource utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>CPU Usage</span>
                      <Badge variant="default">45%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Memory Usage</span>
                      <Badge variant="secondary">68%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Storage Used</span>
                      <Badge variant="outline">2.4TB / 5TB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bandwidth</span>
                      <Badge variant="default">1.2GB/s</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
