
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import AuthPage from './pages/AuthPage';
import EditProfilePage from './pages/EditProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import CreateRoutinePage from './pages/CreateRoutinePage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import RankingPage from './pages/RankingPage';
import RankingDetailPage from './pages/RankingDetailPage';
import GuildLeaderboardPage from './pages/GuildLeaderboardPage';
import GuildsListPage from './pages/GuildsListPage';
import AdminPage from './pages/AdminPage';
import TimerSettingsPage from './pages/TimerSettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/treino" replace />} />
          <Route path="/index" element={<Index />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/treino" element={<WorkoutPage />} />
          <Route path="/treino/ativo/:id" element={<ActiveWorkoutPage />} />
          <Route path="/treino/criar" element={<CreateRoutinePage />} />
          <Route path="/exercicios" element={<ExerciseLibraryPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/ranking/:id" element={<RankingDetailPage />} />
          <Route path="/guilds" element={<GuildsListPage />} />
          <Route path="/guilds/:id/leaderboard" element={<GuildLeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/configuracoes/timer" element={<TimerSettingsPage />} />
          <Route path="/conquistas" element={<AchievementsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
