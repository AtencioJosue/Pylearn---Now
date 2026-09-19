import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { RegisterModal } from "@/components/RegisterModal";
import { AchievementToast } from "@/components/AchievementToast";

const Home = lazy(() =>
  import("@/pages/Home").then((module) => ({ default: module.Home })),
);
const ExerciseView = lazy(() =>
  import("@/pages/ExerciseView").then((module) => ({
    default: module.ExerciseView,
  })),
);
const Playground = lazy(() =>
  import("@/pages/Playground").then((module) => ({
    default: module.Playground,
  })),
);
const Perfil = lazy(() =>
  import("@/pages/Perfil").then((module) => ({ default: module.Perfil })),
);
const Foro = lazy(() =>
  import("@/pages/Foro").then((module) => ({ default: module.Foro })),
);
const Leaderboard = lazy(() =>
  import("@/pages/Leaderboard").then((module) => ({
    default: module.Leaderboard,
  })),
);
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen page-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/exercise/:id" component={ExerciseView} />
        <Route path="/playground" component={Playground} />
        <Route path="/perfil" component={Perfil} />
        <Route path="/foro" component={Foro} />
        <Route path="/ligas" component={Leaderboard} />
        <Route path="/practicar">
          <Redirect to="/" replace />
        </Route>
        <Route path="/juegos">
          <Redirect to="/" replace />
        </Route>
        <Route path="/juegos/*">
          <Redirect to="/" replace />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <GamificationProvider>
            <ThemeProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <div className="app-with-sidebar">
                  <Router />
                </div>
              </WouterRouter>
              <RegisterModal />
              <AchievementToast />
              <Toaster />
            </ThemeProvider>
          </GamificationProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
