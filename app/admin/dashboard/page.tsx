"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Film,
  Activity,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home,
  LogOut,
  BarChart3,
  Settings,
  UserCheck,
  PlayCircle,
} from "lucide-react";

// Mock data for analytics
const userGrowthData = [
  { month: "Jan", users: 1200, active: 980 },
  { month: "Feb", users: 1350, active: 1100 },
  { month: "Mar", users: 1500, active: 1250 },
  { month: "Apr", users: 1680, active: 1400 },
  { month: "May", users: 1850, active: 1580 },
  { month: "Jun", users: 2100, active: 1800 },
];

const movieRequestsData = [
  { status: "Pending", count: 45, color: "hsl(var(--chart-4))" },
  { status: "Approved", count: 32, color: "hsl(var(--chart-3))" },
  { status: "Downloaded", count: 28, color: "hsl(var(--chart-1))" },
  { status: "Rejected", count: 8, color: "hsl(var(--chart-5))" },
];

const topMoviesData = [
  { title: "Spider-Man", views: 15420, rating: 4.8 },
  { title: "Avengers", views: 12350, rating: 4.9 },
  { title: "Batman", views: 11200, rating: 4.7 },
  { title: "Iron Man", views: 9800, rating: 4.6 },
  { title: "Thor", views: 8900, rating: 4.5 },
];

const systemMetrics = [
  { metric: "Server Uptime", value: "99.9%", status: "healthy" },
  { metric: "Response Time", value: "120ms", status: "healthy" },
  { metric: "Storage Used", value: "68%", status: "warning" },
  { metric: "Bandwidth", value: "2.4TB", status: "healthy" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 2100,
    activeUsers: 1800,
    totalMovies: 1250,
    pendingRequests: 45,
    totalViews: 125000,
    avgRating: 4.7,
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "user_signup",
      message: "New user registered: john@example.com",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "movie_request",
      message: "Movie requested: The Dark Knight",
      time: "5 minutes ago",
    },
    {
      id: 3,
      type: "system_alert",
      message: "High server load detected",
      time: "10 minutes ago",
    },
    {
      id: 4,
      type: "movie_approved",
      message: "Movie approved: Spider-Man 2",
      time: "15 minutes ago",
    },
  ]);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel.",
    });
    router.push("/admin/login");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case "movie_request":
        return <Film className="w-4 h-4 text-blue-500" />;
      case "system_alert":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "movie_approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              JOYFLIX Admin
            </h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar">
          <nav className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => router.push("/admin/requests")}
            >
              <Film className="w-4 h-4" />
              Movie Requests
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Users className="w-4 h-4" />
              User Management
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <PlayCircle className="w-4 h-4" />
              Content Library
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.activeUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Movies
                </CardTitle>
                <Film className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalMovies.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+25 this week</p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.pendingRequests}
                </div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="chart-container">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>
                      Monthly user registration and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        users: {
                          label: "Total Users",
                          color: "hsl(var(--chart-1))",
                        },
                        active: {
                          label: "Active Users",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="var(--color-users)"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="active"
                            stroke="var(--color-active)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="chart-container">
                  <CardHeader>
                    <CardTitle>Movie Requests</CardTitle>
                    <CardDescription>
                      Distribution of request statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        pending: {
                          label: "Pending",
                          color: "hsl(var(--chart-4))",
                        },
                        approved: {
                          label: "Approved",
                          color: "hsl(var(--chart-3))",
                        },
                        downloaded: {
                          label: "Downloaded",
                          color: "hsl(var(--chart-1))",
                        },
                        rejected: {
                          label: "Rejected",
                          color: "hsl(var(--chart-5))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={movieRequestsData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {movieRequestsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Movies</CardTitle>
                  <CardDescription>
                    Most viewed movies this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topMoviesData.map((movie, index) => (
                      <div
                        key={movie.title}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-foreground">
                              {movie.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {movie.views.toLocaleString()} views
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {movie.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemMetrics.map((metric) => (
                      <div
                        key={metric.metric}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(metric.status)}
                          <div>
                            <p className="font-medium text-foreground">
                              {metric.metric}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              {metric.value}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            metric.status === "healthy"
                              ? "default"
                              : metric.status === "warning"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {metric.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest system events and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
