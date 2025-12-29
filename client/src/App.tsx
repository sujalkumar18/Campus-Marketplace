import { Switch, Route, Redirect } from "wouter";
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

import AuthPage from "@/pages/AuthPage";
import { useEffect, useState } from "react";

function Router() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <Switch>
      <Route path="/auth">
        {user ? <Redirect to="/home" /> : <AuthPage />}
      </Route>
      <Route path="/">
        {!user ? <Redirect to="/auth" /> : <Home />}
      </Route>
      <Route path="/home">
        {!user ? <Redirect to="/auth" /> : <Home />}
      </Route>
      <Route path="/sell">
        {!user ? <Redirect to="/auth" /> : <Sell />}
      </Route>
      <Route path="/listing/:id">
        {!user ? <Redirect to="/auth" /> : <ListingDetail />}
      </Route>
      <Route path="/chats">
        {!user ? <Redirect to="/auth" /> : <Chats />}
      </Route>
      <Route path="/chats/:id">
        {!user ? <Redirect to="/auth" /> : <ChatDetail />}
      </Route>
      <Route path="/profile">
        {!user ? <Redirect to="/auth" /> : <Profile />}
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
