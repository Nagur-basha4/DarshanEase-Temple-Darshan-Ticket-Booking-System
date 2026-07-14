import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Ticket, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/PageTransition";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function MyBookings() {
  const [, setLocation] = useLocation();
  const [emailQuery, setEmailQuery] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: bookings = [], isLoading, isFetching } = useListBookings(
    searchEmail ? { email: searchEmail } : undefined,
    { query: { enabled: !!searchEmail, queryKey: getListBookingsQueryKey(searchEmail ? { email: searchEmail } : undefined) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailQuery.trim()) {
      setSearchEmail(emailQuery.trim());
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date(); d.setHours(parseInt(h, 10), parseInt(m, 10));
    return format(d, 'h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Confirmed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageTransition className="py-12 bg-muted/10 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">My Bookings</h1>
          <p className="text-muted-foreground">Find and manage your temple darshan tickets.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                type="email"
                placeholder="Enter email used for booking..." 
                className="pl-10 h-12 text-base"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8" disabled={isFetching}>
              {isFetching ? "Searching..." : "Find Bookings"}
            </Button>
          </form>
        </div>

        {searchEmail && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold mb-4">
              Results for "{searchEmail}"
            </h2>

            {isLoading || isFetching ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-2xl border border-border animate-pulse" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground mb-4">No bookings found for this email address.</p>
                <Button variant="outline" onClick={() => setLocation('/temples')}>Browse Temples to Book</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/bookings/${booking.id}`)}
                  >
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded">
                          {booking.bookingRef}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <h3 className="font-display font-bold text-lg text-foreground mb-1">
                        {booking.poojaType?.name || "Darshan"}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {booking.temple?.name || "Temple"}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                        {booking.slot && (
                          <>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-4 h-4 text-primary" />
                              {format(new Date(booking.slot.date), 'dd MMM yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-4 h-4 text-primary" />
                              {formatTime(booking.slot.startTime)}
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1.5 font-medium">
                          <Ticket className="w-4 h-4 text-primary" />
                          {booking.numPersons} Persons
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
