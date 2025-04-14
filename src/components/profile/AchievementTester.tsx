
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';

const AchievementTester: React.FC = () => {
  const { showAchievement } = achievementPopupStore();
  
  const testAchievement = () => {
    // Get a real achievement definition from our centralized system
    const achievements = AchievementUtils.getAllAchievements();
    const randomIndex = Math.floor(Math.random() * achievements.length);
    const achievementDef = achievements[randomIndex];
    
    // Create a fully compliant Achievement object
    const achievement: Achievement = {
      id: achievementDef.id,
      name: achievementDef.name,
      description: achievementDef.description,
      category: achievementDef.category || AchievementCategory.SPECIAL,
      rank: achievementDef.rank,
      points: achievementDef.points,
      xpReward: achievementDef.xpReward,
      iconName: achievementDef.iconName || 'award',
      requirements: {
        type: achievementDef.requirementType,
        value: achievementDef.requirementValue
      },
      metadata: {
        bonusText: "Excede o limite diário"
      }
    };
    
    showAchievement(achievement);
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
