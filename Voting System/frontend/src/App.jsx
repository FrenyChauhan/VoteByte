
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Candidates from "./pages/Candidates";
import Vote from "./pages/Vote";
import Confirmation from "./pages/Confirmation";
import Admin from "./pages/Admin";
import Verification from "./pages/Verification";
import VoteIntegrity from "./pages/VoteIntegrity";
import NotFound from "./pages/NotFound";
import ConnectivityGuard from "./components/ConnectivityGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <ConnectivityGuard />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/vote-integrity" element={<VoteIntegrity />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


