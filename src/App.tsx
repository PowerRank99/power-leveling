import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import ExercisePage from './pages/ExercisePage';
import PremiumPage from './pages/PremiumPage';
import AchievementPage from './pages/AchievementPage';
import ClassBonusTestPage from './pages/ClassBonusTestPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/exercises" element={<ExercisePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/achievements" element={<AchievementPage />} />
          
          {/* Add the new class bonus test route */}
          <Route path="/testing/class-bonus" element={<ClassBonusTestPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
