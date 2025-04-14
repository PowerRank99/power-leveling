
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { AchievementUtils } from '@/constants/AchievementDefinitions';

const AchievementTester: React.FC = () => {
  const { showAchievement } = achievementPopupStore();
  
  const testAchievement = () => {
    // Get a real achievement definition from our centralized system
    const achievements = AchievementUtils.getAllAchievements();
    const randomIndex = Math.floor(Math.random() * achievements.length);
    const achievement = achievements[randomIndex];
    
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
      <Button 
        onClick={testAchievement} 
        className="bg-arcane hover:bg-arcane-60 flex items-center"
      >
        <Trophy className="mr-2 h-4 w-4" />
        Testar Conquista Aleatória
      </Button>
    </div>
  );
};

export default AchievementTester;
