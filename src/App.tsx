
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { ClassProvider } from './contexts/ClassContext';
import { initializeClassSystem, isClassSystemInitialized } from './services/rpg/ClassSystemInitializer';
import AchievementPopup from './components/profile/AchievementPopup';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';

// Import all pages
import LandingPage from './pages/Index';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import CreateRoutinePage from './pages/CreateRoutinePage';
import ClassSelectionPage from './pages/class-selection/ClassSelectionPage';
import AchievementsPage from './pages/AchievementsPage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';
import GuildsListPage from './pages/GuildsListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    if (!isClassSystemInitialized()) {
      initializeClassSystem();
    }
  }, []);

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ClassProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/treino" element={<WorkoutPage />} />
                <Route path="/treino/ativo/:id" element={<ActiveWorkoutPage />} />
                <Route path="/exercicios" element={<ExerciseLibraryPage />} />
                <Route path="/exercicios/:exerciseId" element={<ExerciseLibraryPage />} />
                <Route path="/rotinas/criar" element={<CreateRoutinePage />} />
                <Route path="/rotinas/editar/:routineId" element={<CreateRoutinePage />} />
                <Route path="/selecao-de-classe" element={<ClassSelectionPage />} />
                <Route path="/conquistas" element={<AchievementsPage />} />
                <Route path="/admin-panel" element={<AdminPage />} />
                <Route path="/politica-de-privacidade" element={<NotFound />} />
                <Route path="/termos-de-servico" element={<NotFound />} />
                <Route path="/redefinir-senha" element={<AuthPage />} />
                <Route path="/atualizar-senha" element={<AuthPage />} />
                <Route path="/guilds" element={<GuildsListPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <Toaster />
              
              <AchievementPopup />
            </ClassProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
