import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, User, Menu, Home, Ticket, MapPin, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { admin, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Temples", href: "/temples", icon: MapPin },
    { name: "My Bookings", href: "/bookings", icon: Ticket },
    { name: "Dashboard", href: "/dashboard", icon: BookOpen },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/%3E%3C/svg%3E" alt="Om" className="w-5 h-5 opacity-0" />
              <span className="font-display font-bold text-xl leading-none">ॐ</span>
            </div>
            <span className="font-display font-bold text-xl text-primary tracking-tight">DarshanEase</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary relative py-1 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            {admin ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/admin">
                  <Button variant="outline" className="gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/admin/login">
                <Button variant="outline" className="hidden md:flex gap-2">
                  <User className="w-4 h-4" />
                  <span>Admin Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card mt-auto">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                   <span className="font-display font-bold text-sm leading-none">ॐ</span>
                </div>
                <span className="font-display font-bold text-lg text-primary tracking-tight">DarshanEase</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                A seamless, peaceful way to book temple darshans and poojas across India. May your spiritual journey be blessed.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/temples" className="hover:text-primary transition-colors">Browse Temples</Link></li>
                <li><Link href="/bookings" className="hover:text-primary transition-colors">My Bookings</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-primary transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} DarshanEase. All rights reserved.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1">Made with devotion in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
