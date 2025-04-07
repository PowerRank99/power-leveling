
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthRequiredRoute from "@/components/AuthRequiredRoute";

import Index from "./pages/Index";
import WorkoutPage from "./pages/WorkoutPage";
import RankingPage from "./pages/RankingPage";
import ProfilePage from "./pages/ProfilePage";
import RankingDetailPage from "./pages/RankingDetailPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import AuthPage from "./pages/AuthPage";
import EditProfilePage from "./pages/EditProfilePage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
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
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route path="/treino" element={
              <AuthRequiredRoute>
                <WorkoutPage />
              </AuthRequiredRoute>
            } />
            <Route path="/ranking" element={
              <AuthRequiredRoute>
                <RankingPage />
              </AuthRequiredRoute>
            } />
            <Route path="/perfil" element={
              <AuthRequiredRoute>
                <ProfilePage />
              </AuthRequiredRoute>
            } />
            <Route path="/perfil/editar" element={
              <AuthRequiredRoute>
                <EditProfilePage />
              </AuthRequiredRoute>
            } />
            <Route path="/ranking/:id" element={
              <AuthRequiredRoute>
                <RankingDetailPage />
              </AuthRequiredRoute>
            } />
            <Route path="/treino-atual/:id" element={
              <AuthRequiredRoute>
                <ActiveWorkoutPage />
              </AuthRequiredRoute>
            } />
            <Route path="/biblioteca-exercicios" element={
              <AuthRequiredRoute>
                <ExerciseLibraryPage />
              </AuthRequiredRoute>
            } />
            <Route path="/criar-rotina" element={
              <AuthRequiredRoute>
                <CreateRoutinePage />
              </AuthRequiredRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
