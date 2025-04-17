
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { ClassProvider } from './contexts/ClassContext';
import { initializeClassSystem, isClassSystemInitialized } from './services/rpg/ClassSystemInitializer';

// Import all pages with correct extensions
import LandingPage from './pages/Index';
import LoginPage from './pages/AuthPage';
import RegisterPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExerciseSearchPage from './pages/ExerciseLibraryPage';
import ExerciseDetailsPage from './pages/ExerciseLibraryPage';
import CreateRoutinePage from './pages/CreateRoutinePage';
import EditRoutinePage from './pages/CreateRoutinePage';
import ClassSelectionPage from './pages/class-selection/ClassSelectionPage';
import AchievementsPage from './pages/AchievementsPage';
import AdminPanelPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFound';
import PrivacyPolicyPage from './pages/NotFound';
import TermsOfServicePage from './pages/NotFound';
import PasswordResetPage from './pages/AuthPage';
import PasswordUpdatePage from './pages/AuthPage';
import GuildsListPage from './pages/GuildsListPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Initialize RPG class system at application startup
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth" element={<LoginPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/treino" element={<WorkoutPage />} />
                <Route path="/exercicios" element={<ExerciseSearchPage />} />
                <Route path="/exercicios/:exerciseId" element={<ExerciseDetailsPage />} />
                <Route path="/rotinas/criar" element={<CreateRoutinePage />} />
                <Route path="/rotinas/editar/:routineId" element={<EditRoutinePage />} />
                <Route path="/selecao-de-classe" element={<ClassSelectionPage />} />
                <Route path="/conquistas" element={<AchievementsPage />} />
                <Route path="/admin-panel" element={<AdminPanelPage />} />
                <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
                <Route path="/redefinir-senha" element={<PasswordResetPage />} />
                <Route path="/atualizar-senha" element={<PasswordUpdatePage />} />
                <Route path="/guilds" element={<GuildsListPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              
              {/* Global toast notifications */}
              <Toaster />
            </ClassProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
