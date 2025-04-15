
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';

const AchievementTester: React.FC = () => {
  const { showAchievement } = achievementPopupStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Load achievements when component mounts
  useEffect(() => {
    const loadAchievements = async () => {
      const loadedAchievements = await AchievementUtils.getAllAchievements();
      setAchievements(loadedAchievements);
    };
    
    loadAchievements();
  }, []);
  
  const testAchievement = () => {
    if (achievements.length === 0) return;
    
    // Get a random achievement from our loaded achievements
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
      requirements: achievementDef.requirements || {
        type: 'generic',
        value: 1
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
        disabled={achievements.length === 0}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Testar Conquista Aleatória
      </Button>
    </div>
  );
};

export default AchievementTester;
