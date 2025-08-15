import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import OfflineIndicator from "@/components/offline-indicator";
import OfflineNotification from "@/components/offline-notification";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Events from "@/pages/events";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
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
        <OfflineIndicator />
        <OfflineNotification />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
