import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LockKeyhole, User } from "lucide-react";

export default function AdminLogin() {
  const { login, admin } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect
  if (admin) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#1a0a00] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <span className="text-3xl text-primary">ॐ</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#f4d080] tracking-wide">DarshanEase</h1>
          <p className="text-[#c8884a] text-sm mt-1">Admin Portal</p>
        </div>

        <Card className="border-[#f4a320]/20 bg-white/5 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#f4d080] font-display text-xl flex items-center gap-2">
              <LockKeyhole className="w-5 h-5 text-primary" />
              Admin Sign In
            </CardTitle>
            <CardDescription className="text-[#c8884a]">
              Enter your credentials to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#f4d080]">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8884a]" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-9 bg-white/10 border-[#f4a320]/30 text-[#f4d080] placeholder:text-[#c8884a]/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#f4d080]">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8884a]" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-white/10 border-[#f4a320]/30 text-[#f4d080] placeholder:text-[#c8884a]/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-xs text-[#c8884a]/60 mt-6">
              Default credentials: <span className="font-mono text-[#c8884a]">admin / admin123</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
