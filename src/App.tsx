
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={
          <AuthRequiredRoute>
            <ProfilePage />
          </AuthRequiredRoute>
        } />
        <Route path="/workout" element={
          <AuthRequiredRoute>
            <WorkoutPage />
          </AuthRequiredRoute>
        } />
        <Route path="/exercises" element={<ExercisePage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/achievements" element={<AchievementPage />} />
        <Route path="/classes" element={
          <AuthRequiredRoute>
            <ClassSelectionPage />
          </AuthRequiredRoute>
        } />
        
        {/* Test pages */}
        <Route path="/testing/class-bonus" element={<ClassBonusTestPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
