
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { ACHIEVEMENTS, AchievementUtils } from '@/constants/AchievementDefinitions';

const AchievementNotificationTester: React.FC = () => {
  const { queueNotification } = useAchievementNotificationStore();
  
  const testRandomAchievement = () => {
    // Get all achievements
    const allAchievements = AchievementUtils.getAllAchievements();
    
    // Select a random achievement
    const randomIndex = Math.floor(Math.random() * allAchievements.length);
    const achievement = allAchievements[randomIndex];
    
    queueNotification({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      rank: achievement.rank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      timestamp: new Date().toISOString()
    });
  };
  
  const testMultipleAchievements = () => {
    // Queue 3 random achievements
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        testRandomAchievement();
      }, i * 100);
    }
  };

  return (
    <div className="p-4 flex flex-col space-y-2">
      <Button onClick={testRandomAchievement} className="bg-arcane hover:bg-arcane-60">
        Testar Conquista Aleatória
      </Button>
      <Button onClick={testMultipleAchievements} className="bg-valor hover:bg-valor-60">
        Testar Múltiplas Conquistas
      </Button>
    </div>
  );
};

export default AchievementNotificationTester;
