import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Page Imports
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Sell from "@/pages/Sell";
import Chats from "@/pages/Chats";
import ChatDetail from "@/pages/ChatDetail";
import Profile from "@/pages/Profile";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  
  // Simple check - in real app would wait for loading state
  // For MVP assuming if user query data is missing, we need auth
  if (!user) return <Redirect to="/auth" />;
  
  return <Component />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      {/* Protected Routes */}
      <Route path="/home">
        <PrivateRoute component={Home} />
      </Route>
      <Route path="/sell">
        <PrivateRoute component={Sell} />
      </Route>
      <Route path="/chats">
        <PrivateRoute component={Chats} />
      </Route>
      <Route path="/chats/:id">
        <PrivateRoute component={ChatDetail} />
      </Route>
      <Route path="/profile">
        <PrivateRoute component={Profile} />
      </Route>

      {/* Root Redirect */}
      <Route path="/">
        {user ? <Redirect to="/home" /> : <Redirect to="/auth" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
