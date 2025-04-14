
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { achievementPopupStore, AchievementPopupData } from '@/stores/achievementPopupStore';
import { AchievementUtils } from '@/constants/AchievementDefinitions';

const AchievementTester: React.FC = () => {
  const { showAchievement } = achievementPopupStore();
  
  const testAchievement = () => {
    // Get a real achievement definition from our centralized system
    const achievements = AchievementUtils.getAllAchievements();
    const randomIndex = Math.floor(Math.random() * achievements.length);
    const achievement = achievements[randomIndex];
    
    // Create a popup-compatible achievement object
    const popupData: AchievementPopupData = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      xpReward: achievement.xpReward,
      points: achievement.points,
      rank: achievement.rank,
      category: achievement.category, // Added for completeness
      iconName: achievement.iconName, // Added for completeness
      requirements: { // Added for completeness
        type: achievement.requirementType,
        value: achievement.requirementValue
      },
      metadata: {
        bonusText: "Excede o limite diário"
      }
    };
    
    showAchievement(popupData);
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
