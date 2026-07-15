import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { format, parse, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, IndianRupee, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";

import { 
  useGetPoojaType, 
  useListSlots, 
  useCreateBooking, 
  useGetTemple,
  getListBookingsQueryKey,
  getGetPoojaTypeQueryKey,
  getGetTempleQueryKey,
  getListSlotsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const bookingSchema = z.object({
  devoteeName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  numPersons: z.coerce.number().min(1, "At least 1 person").max(10, "Max 10 persons per booking"),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingFlow() {
  const params = useParams();
  const poojaTypeId = parseInt(params.poojaTypeId || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const { data: pooja, isLoading: isLoadingPooja } = useGetPoojaType(poojaTypeId, {
    query: { enabled: !!poojaTypeId, queryKey: getGetPoojaTypeQueryKey(poojaTypeId) }
  });

  const { data: temple } = useGetTemple(pooja?.templeId || 0, {
    query: { enabled: !!pooja?.templeId, queryKey: getGetTempleQueryKey(pooja?.templeId || 0) }
  });

  const formattedDate = format(date, 'yyyy-MM-dd');
  const { data: slots = [], isLoading: isLoadingSlots } = useListSlots(
    { poojaTypeId, date: formattedDate },
    { query: { enabled: !!poojaTypeId, queryKey: getListSlotsQueryKey({ poojaTypeId, date: formattedDate }) } }
  );

  const createBooking = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      devoteeName: "",
      phone: "",
      email: "",
      numPersons: 1,
      specialRequests: "",
    },
  });

  const numPersons = form.watch("numPersons");
  const totalAmount = (pooja?.pricePerPerson || 0) * (Number(numPersons) || 1);

  const onSubmit = (values: BookingFormValues) => {
    if (!selectedSlotId) {
      toast({
        title: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    createBooking.mutate({
      data: {
        slotId: selectedSlotId,
        devoteeName: values.devoteeName,
        phone: values.phone,
        email: values.email,
        numPersons: values.numPersons,
        specialRequests: values.specialRequests
      }
    }, {
      onSuccess: (booking) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        setLocation(`/bookings/${booking.id}`);
      },
      onError: () => {
        toast({
          title: "Booking failed",
          description: "There was an error creating your booking. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoadingPooja) {
    return (
      <PageTransition className="p-8">
        <div className="container mx-auto max-w-4xl space-y-8 animate-pulse">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-96 bg-muted rounded-xl" />
            </div>
            <div className="h-[500px] bg-muted rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!pooja) {
    return (
      <PageTransition className="flex items-center justify-center flex-1">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Pooja Not Found</h2>
          <Button onClick={() => setLocation('/temples')}>Browse Temples</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="bg-muted/20 min-h-screen py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4 hover:bg-transparent hover:text-primary"
          onClick={() => setLocation(temple ? `/temples/${temple.id}` : '/temples')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Temple
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Complete Your Booking</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-foreground">{pooja.name}</span>
            {temple && <span>at {temple.name}</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Date & Time */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">1</span>
                Select Date & Time
              </h2>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => {
                      if (day) {
                        setDate(day);
                        setSelectedSlotId(null);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    className="rounded-xl border shadow-sm p-3 bg-background"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">Available Slots on {format(date, 'MMM d, yyyy')}</h3>
                  
                  {isLoadingSlots ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-8 text-center bg-muted/50 rounded-xl border border-dashed">
                      <p className="text-muted-foreground">No slots available for this date.</p>
                      <Button variant="link" className="mt-2" onClick={() => setDate(addDays(date, 1))}>
                        Try next day
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {slots.map(slot => {
                        const isSelected = selectedSlotId === slot.id;
                        const isFull = slot.availableSeats <= 0;
                        const formatTime = (timeStr: string) => {
                          const [h, m] = timeStr.split(':');
                          const d = new Date();
                          d.setHours(parseInt(h, 10), parseInt(m, 10));
                          return format(d, 'h:mm a');
                        };

                        return (
                          <button
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={cn(
                              "relative p-3 rounded-xl border text-left transition-all",
                              isFull 
                                ? "opacity-50 cursor-not-allowed bg-muted/50" 
                                : isSelected 
                                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                                  : "bg-background hover:border-primary/50 hover:bg-primary/5",
                            )}
                          >
                            {isSelected && (
                              <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                            )}
                            <div className="font-semibold text-sm">
                              {formatTime(slot.startTime)}
                            </div>
                            <div className={cn("text-xs mt-1 font-medium", isFull ? "text-destructive" : "text-emerald-600")}>
                              {isFull ? "Full" : `${slot.availableSeats} seats left`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 2: Devotee Details */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">2</span>
                Devotee Details
              </h2>
              
              <Form {...form}>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="devoteeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Devotee Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numPersons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Persons</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max={pooja.maxPersons || 10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="For booking confirmation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any specific requirements or queries..." className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </section>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 bg-primary/5 border-b border-border/50">
                <h3 className="font-display font-bold text-lg mb-1">Booking Summary</h3>
                <p className="text-sm text-muted-foreground">{pooja.name}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Date
                  </span>
                  <span className="font-medium">{format(date, 'dd MMM, yyyy')}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time
                  </span>
                  <span className="font-medium">
                    {selectedSlotId && slots.find(s => s.id === selectedSlotId) 
                      ? (() => {
                          const s = slots.find(s => s.id === selectedSlotId)!;
                          const [h, m] = s.startTime.split(':');
                          const d = new Date(); d.setHours(parseInt(h), parseInt(m));
                          return format(d, 'h:mm a');
                        })()
                      : "Not selected"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Persons
                  </span>
                  <span className="font-medium">{numPersons}</span>
                </div>

                <hr className="border-border my-4" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price per person</span>
                  <span>₹{pooja.pricePerPerson}</span>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-primary">₹{totalAmount}</span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex items-start gap-3 text-xs mb-6">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>A digital ticket will be sent to your email. Please carry a valid ID proof during your visit.</p>
                </div>

                <Button 
                  type="submit" 
                  form="booking-form"
                  size="lg" 
                  className="w-full font-bold text-base h-14"
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? "Processing..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
