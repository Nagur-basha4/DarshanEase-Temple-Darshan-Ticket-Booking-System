import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/Shell';
import { AuthProvider } from '@/context/AuthContext';

// Pages
import Home from '@/pages/Home';
import Temples from '@/pages/Temples';
import TempleDetail from '@/pages/TempleDetail';
import BookingFlow from '@/pages/BookingFlow';
import MyBookings from '@/pages/MyBookings';
import BookingConfirmation from '@/pages/BookingConfirmation';
import Dashboard from '@/pages/Dashboard';
import AdminLogin from '@/pages/AdminLogin';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin routes — no Shell wrapper */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />

      {/* Public routes — wrapped in Shell */}
      <Route>
        <Shell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/temples" component={Temples} />
            <Route path="/temples/:id" component={TempleDetail} />
            <Route path="/book/:poojaTypeId" component={BookingFlow} />
            <Route path="/bookings" component={MyBookings} />
            <Route path="/bookings/:id" component={BookingConfirmation} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </Shell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
