import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
import Home from "@/pages/Home";
import Sell from "@/pages/Sell";
import Chats from "@/pages/Chats";
import ChatDetail from "@/pages/ChatDetail";
import Profile from "@/pages/Profile";
import ListingDetail from "@/pages/ListingDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/sell" component={Sell} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/chats" component={Chats} />
      <Route path="/chats/:id" component={ChatDetail} />
      <Route path="/profile" component={Profile} />
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
