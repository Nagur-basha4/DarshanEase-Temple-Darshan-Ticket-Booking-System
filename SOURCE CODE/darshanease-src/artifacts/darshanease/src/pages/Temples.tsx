import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Search, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/layout/PageTransition";
import { useListTemples, useListCities } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Temples() {
  const [location, setLocation] = useLocation();
  // Simple parsing of query params
  const queryParams = new URLSearchParams(window.location.search);
  const initialCity = queryParams.get("city") || "all";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialCity);

  const { data: cities = [] } = useListCities();
  
  // Prepare query params for the API
  const apiParams = selectedCity !== "all" ? { city: selectedCity } : undefined;
  const { data: temples = [], isLoading } = useListTemples(apiParams);

  // Client side text filter
  const filteredTemples = temples.filter(temple => 
    temple.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    temple.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Discover Temples</h1>
          <p className="text-muted-foreground max-w-2xl mb-8">
            Browse our curated list of sacred temples. Filter by city or search to find your spiritual destination.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search temples by name or deity..." 
                className="pl-10 h-12 bg-background border-border/50 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 bg-background border-border/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="All Cities" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.city} value={city.city}>
                      {city.city}, {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl bg-card border border-border h-[400px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredTemples.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">No temples found</h3>
            <p className="text-muted-foreground mb-6">We couldn't find any temples matching your search criteria.</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCity("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemples.map((temple) => (
              <div 
                key={temple.id} 
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={temple.imageUrl || "https://images.unsplash.com/photo-1544413660-299165566b1d"} 
                    alt={temple.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {temple.deity && (
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md text-foreground">
                      {temple.deity}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1 text-sm font-medium text-primary-foreground/90 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {temple.city}, {temple.state}
                    </div>
                    <h3 className="font-display font-bold text-xl drop-shadow-md">{temple.name}</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    {temple.rating && (
                      <div className="flex items-center text-sm font-semibold">
                        <Star className="w-4 h-4 text-accent fill-accent mr-1" />
                        {temple.rating}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground font-medium">
                      {temple.totalBookings || 0} devotees visited
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                    {temple.description}
                  </p>
                  <Button 
                    onClick={() => setLocation(`/temples/${temple.id}`)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
