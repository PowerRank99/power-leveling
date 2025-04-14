
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExercisePage from './pages/ExercisePage';
import PremiumPage from './pages/PremiumPage';
import AchievementPage from './pages/AchievementPage';
import ClassBonusTestPage from './pages/ClassBonusTestPage';
import IndexPage from './pages/Index';
import AuthPage from './pages/AuthPage';
import ClassSelectionPage from './pages/class-selection/ClassSelectionPage';
import AuthRequiredRoute from './components/AuthRequiredRoute';
import GuildsListPage from './pages/GuildsListPage';
import GuildQuestsPage from './pages/GuildQuestsPage';
import CreateQuestPage from './pages/CreateQuestPage';
import GuildLeaderboardPage from './pages/GuildLeaderboardPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import EditProfilePage from './pages/EditProfilePage';
import AchievementNotificationSystem from './components/achievements/AchievementNotificationSystem';

function App() {
  return (
    <AuthProvider>
      {/* Global Achievement Notification System */}
      <AchievementNotificationSystem />
      
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* English routes */}
        <Route path="/profile" element={
          <AuthRequiredRoute>
            <ProfilePage />
          </AuthRequiredRoute>
        } />
        <Route path="/profile/edit" element={
          <AuthRequiredRoute>
            <EditProfilePage />
          </AuthRequiredRoute>
        } />
        <Route path="/workout" element={
          <AuthRequiredRoute>
            <WorkoutPage />
          </AuthRequiredRoute>
        } />
        
        {/* Portuguese routes */}
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
        <Route path="/treino" element={
          <AuthRequiredRoute>
            <WorkoutPage />
          </AuthRequiredRoute>
        } />
        <Route path="/treino/ativo/:id" element={
          <AuthRequiredRoute>
            <ActiveWorkoutPage />
          </AuthRequiredRoute>
        } />
        
        <Route path="/exercises" element={<ExercisePage />} />
        <Route path="/exercicios" element={<ExercisePage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/achievements" element={<AchievementPage />} />
        <Route path="/classes" element={
          <AuthRequiredRoute>
            <ClassSelectionPage />
          </AuthRequiredRoute>
        } />
        
        {/* Guild Routes */}
        <Route path="/guilds" element={
          <AuthRequiredRoute>
            <GuildsListPage />
          </AuthRequiredRoute>
        } />
        <Route path="/guilds/:id/quests" element={
          <AuthRequiredRoute>
            <GuildQuestsPage />
          </AuthRequiredRoute>
        } />
        <Route path="/guilds/:guildId/create-quest" element={
          <AuthRequiredRoute>
            <CreateQuestPage />
          </AuthRequiredRoute>
        } />
        <Route path="/guilds/:id/leaderboard" element={
          <AuthRequiredRoute>
            <GuildLeaderboardPage />
          </AuthRequiredRoute>
        } />
        
        {/* Test pages */}
        <Route path="/testing/class-bonus" element={<ClassBonusTestPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
