
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AchievementTestRunner from '@/components/testing/AchievementTestRunner';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Achievement Test Runner</h1>
        <p className="text-gray-400">
          Test and debug your achievement system with this comprehensive testing tool.
        </p>
      </div>

      {user ? (
        <AchievementTestRunner userId={user.id} />
      ) : (
        <div className="p-8 text-center">
          <p>Please log in to use the Achievement Test Runner.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
