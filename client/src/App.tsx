import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TouristSpots from "./pages/TouristSpots";
import SpotDetail from "./pages/SpotDetail";
import Gallery from "./pages/Gallery";
import Partners from "./pages/Partners";
import Testimonials from "./pages/Testimonials";
import Donations from "./pages/Donations";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pontos-turisticos" component={TouristSpots} />
      <Route path="/pontos-turisticos/:slug" component={SpotDetail} />
      <Route path="/galeria" component={Gallery} />
      <Route path="/parceiros" component={Partners} />
      <Route path="/depoimentos" component={Testimonials} />
      <Route path="/doacoes" component={Donations} />
      <Route path="/contato" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
