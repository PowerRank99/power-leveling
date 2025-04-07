
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import WorkoutPage from "./pages/WorkoutPage";
import RankingPage from "./pages/RankingPage";
import ProfilePage from "./pages/ProfilePage";
import RankingDetailPage from "./pages/RankingDetailPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/treino" element={<WorkoutPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/ranking/:id" element={<RankingDetailPage />} />
          <Route path="/treino-atual/:id" element={<ActiveWorkoutPage />} />
          <Route path="/biblioteca-exercicios" element={<ExerciseLibraryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
