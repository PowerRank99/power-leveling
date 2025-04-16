
import React from 'react';
import { AchievementTestingService } from '@/services/testing/AchievementTestingService';
import { AchievementCategory } from '@/types/achievementTypes';

const AchievementTestRunner: React.FC = () => {
  return (
    <div className="text-text-secondary p-4 bg-midnight-card rounded">
      <h2>Achievement Testing Disabled</h2>
      <p>The achievement system has been removed.</p>
    </div>
  );
};

export default AchievementTestRunner;
