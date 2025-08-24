"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

interface MovieRequest {
  _id: string;
  movieId: string;
  title: string;
  year?: number;
  user: string;
  status: "pending" | "approved" | "downloaded" | "rejected";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

// Mock data for analytics
const userGrowthData = [
  { month: "Jan", users: 1200, active: 980 },
  { month: "Feb", users: 1350, active: 1100 },
  { month: "Mar", users: 1500, active: 1250 },
  { month: "Apr", users: 1680, active: 1400 },
  { month: "May", users: 1850, active: 1580 },
  { month: "Jun", users: 2100, active: 1800 },
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
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 2100,
    activeUsers: 1800,
    totalMovies: 1250,
    pendingRequests: 0,
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

  const fetchMovieRequests = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoadingRequests(true);

        const response = await fetch("/api/request-movie", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        if (response.ok) {
          const requests = await response.json();
          setMovieRequests(requests);
          setLastUpdated(new Date());
          setIsOnline(true);

          // Update stats with real data
          const pendingCount = requests.filter(
            (req: MovieRequest) => req.status === "pending"
          ).length;
          setStats((prev) => ({ ...prev, pendingRequests: pendingCount }));
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch movie requests:", error);
        setIsOnline(false);

        if (showLoading) {
          toast({
            title: "Connection Error",
            description: "Failed to load movie requests. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (showLoading) setLoadingRequests(false);
      }
    },
    [toast]
  );

  const updateRequestStatus = async (requestId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) {
      return;
    }

    try {
      setUpdatingRequest(requestId);

      const response = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: requestId, status }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        });
        await fetchMovieRequests(false);
      } else {
        throw new Error(result.error || "Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive",
      });
    } finally {
      setUpdatingRequest(null);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUpdatingRequest(requestId);

      const response = await fetch("/api/request-movie", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: requestId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Request deleted successfully",
        });
        setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
        await fetchMovieRequests(false);
      } else {
        throw new Error(result.error || "Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive",
      });
    } finally {
      setUpdatingRequest(null);
    }
  };

  const bulkUpdateStatus = async (requestIds: string[], status: string) => {
    try {
      setUpdatingRequest("bulk");

      const promises = requestIds.map((id) =>
        fetch("/api/request-movie", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: id, status }),
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      toast({
        title: "Bulk Update Complete",
        description: `${successful}/${requestIds.length} requests updated successfully`,
      });

      setSelectedRequests([]);
      fetchMovieRequests(false);
    } catch (error) {
      console.error("Bulk update error:", error);
      toast({
        title: "Error",
        description: "Failed to update some requests",
        variant: "destructive",
      });
    } finally {
      setUpdatingRequest(null);
    }
  };

  const bulkDelete = async (requestIds: string[]) => {
    try {
      setUpdatingRequest("bulk");

      const promises = requestIds.map((id) =>
        fetch("/api/request-movie", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: id }),
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      toast({
        title: "Bulk Delete Complete",
        description: `${successful}/${requestIds.length} requests deleted successfully`,
      });

      setSelectedRequests([]);
      fetchMovieRequests(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete some requests",
        variant: "destructive",
      });
    } finally {
      setUpdatingRequest(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear JWT cookie
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear localStorage and redirect regardless of API response
      localStorage.removeItem("isAdmin");
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin/login");
      return;
    }

    fetchMovieRequests(true);

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchMovieRequests(false);
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [router, fetchMovieRequests, autoRefresh]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchMovieRequests(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchMovieRequests]);

  const movieRequestsData = [
    {
      status: "Pending",
      count: movieRequests.filter((req) => req.status === "pending").length,
      color: "bg-yellow-500",
    },
    {
      status: "Approved",
      count: movieRequests.filter((req) => req.status === "approved").length,
      color: "bg-green-500",
    },
    {
      status: "Downloaded",
      count: movieRequests.filter((req) => req.status === "downloaded").length,
      color: "bg-blue-500",
    },
    {
      status: "Rejected",
      count: movieRequests.filter((req) => req.status === "rejected").length,
      color: "bg-red-500",
    },
  ];

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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-600 text-white",
      approved: "bg-green-600 text-white",
      downloaded: "bg-blue-600 text-white",
      rejected: "bg-red-600 text-white",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-600 text-white"
    );
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
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMovieRequests(true)}
              disabled={loadingRequests}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`gap-2 ${
                autoRefresh ? "bg-green-50 text-green-700" : ""
              }`}
            >
              <Activity className="w-4 h-4" />
              Auto: {autoRefresh ? "ON" : "OFF"}
            </Button>
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
            <Card className="metric-card hover:shadow-lg transition-shadow">
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
                <div className="w-full bg-muted rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: "85%" }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-lg transition-shadow">
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
                <div className="w-full bg-muted rounded-full h-1 mt-2">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: "78%" }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-lg transition-shadow">
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
                <div className="w-full bg-muted rounded-full h-1 mt-2">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: "92%" }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-lg transition-shadow">
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
                <div className="w-full bg-muted rounded-full h-1 mt-2">
                  <div
                    className="bg-yellow-500 h-1 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (stats.pendingRequests / 10) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="requests">Movie Requests</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Film className="w-5 h-5" />
                        Movie Requests Management
                      </CardTitle>
                      <CardDescription>
                        Monitor and manage user movie requests
                      </CardDescription>
                    </div>
                    {selectedRequests.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {selectedRequests.length} selected
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            bulkUpdateStatus(selectedRequests, "approved")
                          }
                          disabled={updatingRequest === "bulk"}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve All
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => bulkDelete(selectedRequests)}
                          disabled={updatingRequest === "bulk"}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : movieRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No movie requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {movieRequests.map((request) => (
                        <div
                          key={request._id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedRequests.includes(request._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRequests((prev) => [
                                    ...prev,
                                    request._id,
                                  ]);
                                } else {
                                  setSelectedRequests((prev) =>
                                    prev.filter((id) => id !== request._id)
                                  );
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-foreground">
                                  {request.title}
                                </h4>
                                <Badge
                                  className={getStatusBadge(request.status)}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>
                                  Year: {request.year || "N/A"} • User:{" "}
                                  {request.user}
                                </p>
                                <p>
                                  Requested:{" "}
                                  {new Date(request.createdAt).toLocaleString()}
                                </p>
                                {request.adminNotes && (
                                  <p className="text-xs bg-muted p-2 rounded">
                                    Notes: {request.adminNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/requests`)}
                              className="gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>

                            {request.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateRequestStatus(request._id, "approved")
                                }
                                disabled={updatingRequest === request._id}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                            )}

                            {request.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateRequestStatus(request._id, "downloaded")
                                }
                                disabled={updatingRequest === request._id}
                                className="gap-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <Download className="w-4 h-4" />
                                Downloaded
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRequest(request._id)}
                              disabled={updatingRequest === request._id}
                              className="gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>
                      Monthly user registration and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userGrowthData.map((data, index) => (
                        <div
                          key={data.month}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="min-w-[3rem]">
                              {data.month}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                Total: {data.users.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Active: {data.active.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="w-32 bg-muted rounded-full h-3 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${(data.active / data.users) * 100}%`,
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-white mix-blend-difference">
                                {Math.round((data.active / data.users) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Movie Requests</CardTitle>
                    <CardDescription>
                      Distribution of request statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {movieRequestsData.map((data) => {
                        const total = movieRequestsData.reduce(
                          (sum, item) => sum + item.count,
                          0
                        );
                        const percentage =
                          total > 0 ? (data.count / total) * 100 : 0;

                        return (
                          <div key={data.status} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full ${data.color} shadow-sm`}
                                />
                                <span className="font-medium">
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{data.count}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${data.color}`}
                                style={{
                                  width: `${Math.max(percentage, 2)}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
