
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ClassProvider } from '@/contexts/ClassContext';
import { Toaster } from 'sonner';
import AchievementNotificationSystem from './components/achievements/AchievementNotificationSystem';

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
import GuildLeaderboardPage from './pages/GuildLeaderboardPage';
import GuildsListPage from './pages/GuildsListPage';
import AdminPage from './pages/AdminPage';
import TimerSettingsPage from './pages/TimerSettingsPage';
import GuildQuestsPage from './pages/GuildQuestsPage';
import CreateQuestPage from './pages/CreateQuestPage';
import AchievementPopup from './components/profile/AchievementPopup';
import ClassSelectionPage from './pages/class-selection/ClassSelectionPage';
import AchievementTestingPage from './pages/AchievementTestingPage';

function App() {
  return (
    <AuthProvider>
      <ClassProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/treino" element={<WorkoutPage />} />
          <Route path="/treino/ativo/:id" element={<ActiveWorkoutPage />} />
          <Route path="/treino/criar" element={<CreateRoutinePage />} />
          <Route path="/exercicios" element={<ExerciseLibraryPage />} />
          <Route path="/guilds" element={<GuildsListPage />} />
          <Route path="/guilds/:id/leaderboard" element={<GuildLeaderboardPage />} />
          <Route path="/guilds/:id/quests" element={<GuildQuestsPage />} />
          <Route path="/guilds/:id/quests/criar" element={<CreateQuestPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/achievement-testing" element={<AchievementTestingPage />} />
          <Route path="/configuracoes/timer" element={<TimerSettingsPage />} />
          <Route path="/conquistas" element={<AchievementsPage />} />
          <Route path="/classes" element={<ClassSelectionPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <AchievementPopup />
        <AchievementNotificationSystem />
      </ClassProvider>
    </AuthProvider>
  );
}

export default App;
