
import React from 'react';
import { Button } from '@/components/ui/button';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { ACHIEVEMENTS } from '@/constants/AchievementDefinitions';

const AchievementTester: React.FC = () => {
  const { showAchievement } = achievementPopupStore();
  
  const testAchievement = () => {
    // Get a real achievement definition from our constants
    const achievement = ACHIEVEMENTS.WORKOUTS.FIRST_WORKOUT;
    
    showAchievement({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      xpReward: achievement.xpReward,
      points: achievement.points,
      rank: achievement.rank,
      bonusText: "Excede o limite diário"
    });
  };

  return (
    <div className="p-4">
      <Button onClick={testAchievement} className="bg-purple-500 hover:bg-purple-600">
        Testar Conquista
      </Button>
    </div>
  );
};

export default AchievementTester;
