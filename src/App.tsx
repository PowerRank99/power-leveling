
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import WorkoutPage from "./pages/WorkoutPage";
import RankingPage from "./pages/RankingPage";
import ProfilePage from "./pages/ProfilePage";
import RankingDetailPage from "./pages/RankingDetailPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import AuthPage from "./pages/AuthPage";
import EditProfilePage from "./pages/EditProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/treino" element={<WorkoutPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
            <Route path="/ranking/:id" element={<RankingDetailPage />} />
            <Route path="/treino-atual/:id" element={<ActiveWorkoutPage />} />
            <Route path="/biblioteca-exercicios" element={<ExerciseLibraryPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
