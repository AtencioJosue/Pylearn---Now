import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { ExerciseView } from "@/pages/ExerciseView";
import { Playground } from "@/pages/Playground";
import { Perfil } from "@/pages/Perfil";
import { Foro } from "@/pages/Foro";
import NotFound from "@/pages/not-found";
import { UserProvider } from "@/context/UserContext";
import { RegisterModal } from "@/components/RegisterModal";
import { AchievementToast } from "@/components/AchievementToast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exercise/:id" component={ExerciseView} />
      <Route path="/playground" component={Playground} />
      <Route path="/perfil" component={Perfil} />
      <Route path="/foro" component={Foro} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <RegisterModal />
          <AchievementToast />
          <Toaster />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
