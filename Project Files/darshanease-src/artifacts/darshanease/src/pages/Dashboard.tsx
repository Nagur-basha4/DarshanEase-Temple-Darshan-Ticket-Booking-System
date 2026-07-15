import { PageTransition } from "@/components/layout/PageTransition";
import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ticket, MapPin, IndianRupee, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <PageTransition className="p-8">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!stats) return null;

  return (
    <PageTransition className="p-8 bg-muted/10 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Platform Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time statistics across all temples</p>
          </div>
          <div className="text-sm font-medium bg-background px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Data
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Temples</CardTitle>
              <MapPin className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTemples}</div>
              <p className="text-xs text-muted-foreground mt-1">Listed on platform</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bookings Today</CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookingsToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Darshans scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Bookings</CardTitle>
              <Ticket className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Future slots booked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime booking value</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Temples */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-display">Popular Temples</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-6">
                {stats.popularTemples.map((temple, idx) => (
                  <div key={temple.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <Link href={`/temples/${temple.id}`} className="font-semibold hover:text-primary hover:underline">
                          {temple.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{temple.city}, {temple.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{temple.totalBookings}</div>
                      <div className="text-xs text-muted-foreground">bookings</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings Feed */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-display">Recent Bookings Feed</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0 last:border-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{booking.devoteeName}</div>
                        <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                          {booking.bookingRef}
                        </div>
                      </div>
                      <p className="text-sm mb-1 text-card-foreground/90">
                        Booked <span className="font-semibold">{booking.poojaType?.name}</span> for {booking.numPersons} person(s)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                  No recent bookings
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
