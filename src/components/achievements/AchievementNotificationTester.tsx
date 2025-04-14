
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Zap } from 'lucide-react';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { AchievementRank } from '@/types/achievementTypes';

const AchievementNotificationTester: React.FC = () => {
  const { queueNotification } = useAchievementNotificationStore();
  
  const testRandomAchievement = () => {
    // Get all achievements using our centralized system
    const allAchievements = AchievementUtils.getAllAchievements();
    
    // Select a random achievement
    const randomIndex = Math.floor(Math.random() * allAchievements.length);
    const achievement = allAchievements[randomIndex];
    
    // Ensure rank is a valid AchievementRank
    const validRank: AchievementRank = achievement.rank === 'Unranked' ? AchievementRank.E : achievement.rank as AchievementRank;
    
    queueNotification({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      rank: validRank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      timestamp: new Date().toISOString()
    });
  };
  
  const testRandomRankAchievement = (rank: AchievementRank) => {
    // Get achievements of a specific rank
    const rankAchievements = AchievementUtils.getAchievementsByRank(rank);
    
    if (rankAchievements.length === 0) {
      console.warn(`No achievements found for rank ${rank}`);
      return;
    }
    
    // Select a random achievement from this rank
    const randomIndex = Math.floor(Math.random() * rankAchievements.length);
    const achievement = rankAchievements[randomIndex];
    
    queueNotification({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      rank: rank,
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
      <Button onClick={testRandomAchievement} className="bg-arcane hover:bg-arcane-60 flex items-center">
        <Trophy className="mr-2 h-4 w-4" />
        Conquista Aleatória
      </Button>
      
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => testRandomRankAchievement(AchievementRank.S)} className="bg-achievement hover:bg-achievement-60 flex items-center">
          <Sparkles className="mr-2 h-4 w-4" />
          Rank S
        </Button>
        
        <Button onClick={() => testRandomRankAchievement(AchievementRank.E)} className="bg-midnight-elevated hover:bg-midnight-card flex items-center">
          <Zap className="mr-2 h-4 w-4" />
          Rank E
        </Button>
      </div>
      
      <Button onClick={testMultipleAchievements} className="bg-valor hover:bg-valor-60">
        Múltiplas Conquistas
      </Button>
    </div>
  );
};

export default AchievementNotificationTester;
