import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { CheckCircle2, XCircle, MapPin, Calendar, Clock, Users, ArrowLeft, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/PageTransition";
import { useGetBooking, useCancelBooking, getGetBookingQueryKey } from "@workspace/api-client-react";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BookingConfirmation() {
  const params = useParams();
  const bookingId = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: booking, isLoading } = useGetBooking(bookingId, {
    query: { enabled: !!bookingId, queryKey: getGetBookingQueryKey(bookingId) }
  });

  const cancelMutation = useCancelBooking();

  const handleCancel = () => {
    cancelMutation.mutate({ id: bookingId }, {
      onSuccess: () => {
        toast({ title: "Booking Cancelled", description: "Your booking has been successfully cancelled." });
        queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(bookingId) });
      },
      onError: () => {
        toast({ title: "Action Failed", description: "Could not cancel booking.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <PageTransition className="p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-card rounded-3xl h-[600px] animate-pulse border border-border" />
      </PageTransition>
    );
  }

  if (!booking) {
    return (
      <PageTransition className="flex flex-col items-center justify-center p-8 flex-1">
        <h2 className="text-2xl font-display font-bold mb-4">Booking Not Found</h2>
        <Button onClick={() => setLocation('/')}>Return Home</Button>
      </PageTransition>
    );
  }

  const { temple, poojaType, slot } = booking;
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date(); d.setHours(parseInt(h, 10), parseInt(m, 10));
    return format(d, 'h:mm a');
  };

  return (
    <PageTransition className="py-12 bg-muted/20 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4"
          onClick={() => setLocation('/bookings')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          My Bookings
        </Button>

        {/* Ticket Container */}
        <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden relative">
          
          {/* Ticket Header */}
          <div className={`p-8 text-center text-white relative ${isCancelled ? 'bg-destructive/80' : 'bg-primary'}`}>
            {/* Decorative circles for ticket effect */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-r border-transparent" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-l border-transparent" />
            
            <div className="flex justify-center mb-4">
              {isCancelled ? (
                <XCircle className="w-16 h-16 opacity-90" />
              ) : (
                <CheckCircle2 className="w-16 h-16 opacity-90" />
              )}
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              {isCancelled ? "Booking Cancelled" : "Booking Confirmed!"}
            </h1>
            <p className="text-white/80 text-sm max-w-md mx-auto">
              {isCancelled 
                ? "This darshan booking has been cancelled and is no longer valid."
                : "Your divine journey is scheduled. Please present this digital ticket at the temple entrance."}
            </p>
          </div>

          <div className="relative border-b-2 border-dashed border-border/60" />

          {/* Ticket Content */}
          <div className="p-8 md:p-12">
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Booking Reference</p>
                <div className="font-mono text-3xl font-bold tracking-tight text-foreground bg-muted px-4 py-2 rounded-lg inline-block">
                  {booking.bookingRef}
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">₹{booking.totalAmount}</p>
              </div>
            </div>

            {temple && poojaType && slot && (
              <div className="bg-muted/30 rounded-2xl p-6 mb-10 border border-border/50">
                <h3 className="font-display font-bold text-xl mb-4">{poojaType.name}</h3>
                <div className="flex items-start gap-3 text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{temple.name}</p>
                    <p className="text-sm">{temple.location}, {temple.city}, {temple.state}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" /> Date
                    </div>
                    <p className="font-medium">{format(new Date(slot.date), 'EEEE, dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" /> Time
                    </div>
                    <p className="font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
              <div>
                <p className="text-sm text-muted-foreground">Lead Devotee</p>
                <p className="font-medium">{booking.devoteeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Persons</p>
                <p className="font-medium flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" /> {booking.numPersons}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{booking.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{booking.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-border/50">
              {!isCancelled && !isCompleted && (
                <>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
                    <Download className="w-4 h-4 mr-2" /> Download Ticket
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        Cancel Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your darshan slot and initiate a refund according to the temple's policy. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, Cancel it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {isCancelled && (
                <Button className="w-full" onClick={() => setLocation('/temples')}>
                  Book New Darshan
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
