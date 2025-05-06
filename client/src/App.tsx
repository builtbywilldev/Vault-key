import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Seeded from "@/pages/Seeded";
import Passphrase from "@/pages/Passphrase";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SavedPasswords from "@/pages/SavedPasswords";
import Morpheus from "@/pages/Morpheus";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/seeded" component={Seeded} />
      <Route path="/passphrase" component={Passphrase} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/saved-passwords" component={SavedPasswords} />
      <Route path="/morpheus" component={Morpheus} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
