import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { MapPin, Search, Calendar, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/layout/PageTransition";
import { useListCities, useListTemples } from "@workspace/api-client-react";
import heroImage from "@assets/generated_images/hero-temple.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: cities = [] } = useListCities();
  const { data: featuredTemples = [], isLoading: isLoadingTemples } = useListTemples({ city: undefined });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/temples?city=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/temples');
    }
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" />
          {/* Use the generated image for the hero */}
          <img 
            src={heroImage} 
            alt="Temple Courtyard" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="container relative z-20 px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Book your divine journey</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white drop-shadow-lg mb-6 max-w-4xl leading-tight"
          >
            Experience the <span className="text-primary-foreground">Divine</span> with Peace of Mind
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/90 drop-shadow-md mb-10 max-w-2xl"
          >
            Book your darshan and pooja slots at revered temples across India. Skip the queues, focus on your devotion.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-2xl bg-background rounded-2xl p-2 shadow-xl border border-border/50 backdrop-blur-xl"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <MapPin className="absolute left-4 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Where is your spiritual journey taking you?" 
                  className="pl-12 h-14 bg-transparent border-none shadow-none text-base focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  list="cities"
                />
                <datalist id="cities">
                  {cities.map(c => <option key={c.city} value={c.city} />)}
                </datalist>
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-semibold shadow-md">
                Find Temples
                <Search className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Sacred Destinations</h2>
            <div className="w-16 h-1 bg-primary rounded-full mb-4"></div>
            <p className="text-muted-foreground max-w-2xl">Discover temples in India's most holy cities.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {cities.slice(0, 4).map((city, idx) => (
              <button 
                key={city.city}
                onClick={() => setLocation(`/temples?city=${encodeURIComponent(city.city)}`)}
                className="group relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <MapPin className="w-8 h-8 text-primary/60 mb-3 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <h3 className="font-display font-bold text-lg md:text-xl group-hover:text-primary transition-colors">{city.city}</h3>
                <p className="text-sm text-muted-foreground mt-1">{city.state}</p>
                <span className="mt-3 text-xs font-medium bg-muted px-2 py-1 rounded-md">{city.templeCount} Temples</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Temples */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Revered Temples</h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>
            <Button variant="ghost" onClick={() => setLocation('/temples')} className="hidden md:flex">
              View All <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          {isLoadingTemples ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl bg-card border border-border h-[400px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTemples.slice(0, 3).map((temple) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none"
                    >
                      View Details & Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" onClick={() => setLocation('/temples')} className="w-full mt-8 md:hidden">
            View All Temples
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Your Spiritual Journey</h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-16"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-secondary-foreground/20 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-background text-primary flex items-center justify-center mb-6 shadow-lg">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Discover</h3>
              <p className="text-secondary-foreground/80 max-w-xs">
                Find renowned temples and browse their available darshans and poojas.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-background text-primary flex items-center justify-center mb-6 shadow-lg">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Select</h3>
              <p className="text-secondary-foreground/80 max-w-xs">
                Choose your preferred date and time slot that fits your pilgrimage schedule.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-background text-primary flex items-center justify-center mb-6 shadow-lg">
                <span className="font-display font-bold text-2xl">ॐ</span>
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Experience</h3>
              <p className="text-secondary-foreground/80 max-w-xs">
                Arrive with your digital ticket and enjoy a peaceful, organized divine darshan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

