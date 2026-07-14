import { useLocation, useParams } from "wouter";
import { MapPin, Star, Users, Clock, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/PageTransition";
import { useGetTemple, useListTemplePoojaTypes, getGetTempleQueryKey, getListTemplePoojaTypesQueryKey } from "@workspace/api-client-react";

export default function TempleDetail() {
  const params = useParams();
  const templeId = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();

  const { data: temple, isLoading: isLoadingTemple } = useGetTemple(templeId, {
    query: { enabled: !!templeId, queryKey: getGetTempleQueryKey(templeId) }
  });
  
  const { data: poojas = [], isLoading: isLoadingPoojas } = useListTemplePoojaTypes(templeId, {
    query: { enabled: !!templeId, queryKey: getListTemplePoojaTypesQueryKey(templeId) }
  });

  if (isLoadingTemple) {
    return (
      <PageTransition className="p-8">
        <div className="container mx-auto max-w-5xl space-y-8 animate-pulse">
          <div className="h-[40vh] bg-muted rounded-3xl" />
          <div className="h-12 bg-muted w-1/3 rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!temple) {
    return (
      <PageTransition className="flex items-center justify-center flex-1">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Temple Not Found</h2>
          <p className="text-muted-foreground mb-4">The temple you are looking for does not exist.</p>
          <Button onClick={() => setLocation('/temples')}>Back to Temples</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Hero Image */}
      <div className="w-full h-[40vh] md:h-[50vh] relative">
        <img 
          src={temple.imageUrl || "https://images.unsplash.com/photo-1544413660-299165566b1d"} 
          alt={temple.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {temple.deity || "Sacred Temple"}
                </Badge>
                {temple.rating && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    {temple.rating}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                {temple.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {temple.location}, {temple.city}, {temple.state}
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto font-semibold px-8" onClick={() => {
              // scroll to poojas section
              document.getElementById('pooja-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Book Darshan
            </Button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-card-foreground/80">{temple.description}</p>
          </div>
        </div>

        {/* Poojas Section */}
        <div id="pooja-section" className="scroll-mt-24">
          <h2 className="text-3xl font-display font-bold mb-2">Darshan & Poojas</h2>
          <p className="text-muted-foreground mb-8">Select a divine offering to book your slot.</p>

          {isLoadingPoojas ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : poojas.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed">
              <p className="text-muted-foreground">No poojas available for booking at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {poojas.map((pooja) => (
                <div key={pooja.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold flex items-center gap-2">
                        {pooja.name}
                        {pooja.isSpecial && (
                          <Badge className="bg-accent text-accent-foreground ml-2">Special</Badge>
                        )}
                      </h3>
                      <p className="text-2xl font-semibold mt-2 text-primary">₹{pooja.pricePerPerson}</p>
                    </div>
                    <Button onClick={() => setLocation(`/book/${pooja.id}`)}>Select</Button>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-1">{pooja.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-sm">
                    <div className="flex items-center gap-2 text-card-foreground/80">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{pooja.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-card-foreground/80">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Max {pooja.maxPersons || "Unlimited"} persons</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
