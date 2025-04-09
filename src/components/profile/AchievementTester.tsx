
import React from 'react';
import { Button } from '@/components/ui/button';
import { achievementPopupStore } from '@/stores/achievementPopupStore';

const AchievementTester: React.FC = () => {
  const testAchievement = () => {
    achievementPopupStore.showAchievement({
      title: "Guerreiro Dedicado",
      description: "Complete 100 treinos",
      xpReward: 50,
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
