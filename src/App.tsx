import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { ClassProvider } from './contexts/ClassContext';
import { initializeClassSystem, isClassSystemInitialized } from './services/rpg/ClassSystemInitializer';

// Import all pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExerciseSearchPage from './pages/ExerciseSearchPage';
import ExerciseDetailsPage from './pages/ExerciseDetailsPage';
import CreateRoutinePage from './pages/CreateRoutinePage';
import EditRoutinePage from './pages/EditRoutinePage';
import ClassSelectionPage from './pages/class-selection/ClassSelectionPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PasswordResetPage from './pages/PasswordResetPage';
import PasswordUpdatePage from './pages/PasswordUpdatePage';

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
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/treino" element={<WorkoutPage />} />
                <Route path="/exercicios" element={<ExerciseSearchPage />} />
                <Route path="/exercicios/:exerciseId" element={<ExerciseDetailsPage />} />
                <Route path="/rotinas/criar" element={<CreateRoutinePage />} />
                <Route path="/rotinas/editar/:routineId" element={<EditRoutinePage />} />
                <Route path="/selecao-de-classe" element={<ClassSelectionPage />} />
                <Route path="/admin-panel" element={<AdminPanelPage />} />
                <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
                <Route path="/redefinir-senha" element={<PasswordResetPage />} />
                <Route path="/atualizar-senha" element={<PasswordUpdatePage />} />
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
