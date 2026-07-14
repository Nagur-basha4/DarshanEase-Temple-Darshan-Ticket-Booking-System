import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, BookOpen, MapPin, Users, IndianRupee,
  RefreshCw, CheckCircle2, XCircle, Clock, Building2
} from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

function statusBadge(status: string) {
  if (status === "confirmed") return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
  if (status === "cancelled") return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
}

export default function AdminPanel() {
  const { admin, logout, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !admin) navigate("/admin/login");
  }, [admin, loading, navigate]);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const statusQ = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const [bookRes, templeRes, dashRes] = await Promise.all([
        fetch(`${API}/api/admin/bookings${statusQ}`, { credentials: "include" }),
        fetch(`${API}/api/admin/temples`, { credentials: "include" }),
        fetch(`${API}/api/dashboard`, { credentials: "include" }),
      ]);
      const [b, t, d] = await Promise.all([bookRes.json(), templeRes.json(), dashRes.json()]);
      setBookings(b.bookings ?? []);
      setTemples(t);
      setDashboard(d);
    } catch {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setDataLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { if (admin) fetchData(); }, [admin, fetchData]);

  const updateBookingStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Booking updated successfully" });
      fetchData();
    } catch {
      toast({ title: "Failed to update booking", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground">ॐ</span>
              </div>
              <span className="font-display font-bold text-lg text-primary">DarshanEase</span>
            </Link>
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              Signed in as <strong className="text-foreground">{admin?.username}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage bookings, temples and platform statistics</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Temples", value: dashboard?.totalTemples, icon: Building2, color: "text-orange-500" },
            { label: "Bookings Today", value: dashboard?.totalBookingsToday, icon: BookOpen, color: "text-blue-500" },
            { label: "Upcoming", value: dashboard?.upcomingBookings, icon: Clock, color: "text-purple-500" },
            { label: "Total Revenue", value: dashboard ? `₹${dashboard.totalRevenue?.toLocaleString("en-IN")}` : null, icon: IndianRupee, color: "text-green-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {dataLoading
                      ? <Skeleton className="h-8 w-16 mt-1" />
                      : <p className="text-2xl font-bold mt-1">{value ?? "—"}</p>}
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings" className="gap-2"><BookOpen className="w-4 h-4" />Bookings</TabsTrigger>
            <TabsTrigger value="temples" className="gap-2"><MapPin className="w-4 h-4" />Temples</TabsTrigger>
          </TabsList>

          {/* ── Bookings Tab ── */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">All Bookings</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No bookings found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border/40 bg-muted/30">
                        <tr>
                          {["Ref", "Devotee", "Temple / Pooja", "Date & Slot", "Persons", "Amount", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{b.bookingRef}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{b.devoteeName}</div>
                              <div className="text-muted-foreground text-xs">{b.phone}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{b.temple?.name ?? "—"}</div>
                              <div className="text-muted-foreground text-xs">{b.poojaType?.name ?? "—"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{b.slot?.date ?? "—"}</div>
                              <div className="text-muted-foreground text-xs">{b.slot?.startTime} – {b.slot?.endTime}</div>
                            </td>
                            <td className="px-4 py-3 text-center">{b.numPersons}</td>
                            <td className="px-4 py-3 font-semibold">₹{b.totalAmount?.toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">{statusBadge(b.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {b.status !== "confirmed" && (
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-green-700 border-green-200 hover:bg-green-50"
                                    disabled={updatingId === b.id}
                                    onClick={() => updateBookingStatus(b.id, "confirmed")}>
                                    <CheckCircle2 className="w-3 h-3" />
                                  </Button>
                                )}
                                {b.status === "confirmed" && (
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                                    disabled={updatingId === b.id}
                                    onClick={() => updateBookingStatus(b.id, "completed")}>
                                    <Clock className="w-3 h-3" />
                                  </Button>
                                )}
                                {b.status !== "cancelled" && (
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-red-700 border-red-200 hover:bg-red-50"
                                    disabled={updatingId === b.id}
                                    onClick={() => updateBookingStatus(b.id, "cancelled")}>
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Temples Tab ── */}
          <TabsContent value="temples">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">All Temples</CardTitle>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border/40 bg-muted/30">
                        <tr>
                          {["#", "Temple", "Location", "Deity", "Rating", "Total Bookings"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {temples.map((t, i) => (
                          <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-lg object-cover bg-muted" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1545126255-b8e7ec17d9a8?w=80"; }} />
                                <span className="font-semibold">{t.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{t.city}</div>
                              <div className="text-muted-foreground text-xs">{t.state}</div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{t.deity ?? "—"}</td>
                            <td className="px-4 py-3">
                              {t.rating != null
                                ? <span className="flex items-center gap-1">⭐ {t.rating}</span>
                                : "—"}
                            </td>
                            <td className="px-4 py-3 font-semibold">{t.totalBookings?.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
