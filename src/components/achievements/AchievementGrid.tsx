
import React from 'react';
import AchievementCard from './AchievementCard';
import { Award, Dumbbell, Calendar, Target, Flame, Clock, Users, Zap, Shield, Crown, Star } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';

interface AchievementGridProps {
  achievements: Achievement[];
  title: string;
  onAchievementClick?: (achievement: Achievement) => void;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ 
  achievements, 
  title,
  onAchievementClick
}) => {
  if (achievements.length === 0) {
    return (
      <div className="premium-card mb-6">
        <h3 className="text-xl font-orbitron font-bold mb-4 p-4 border-b border-divider/30 text-text-primary">{title}</h3>
        <div className="text-text-secondary text-center py-8 font-sora">
          Nenhuma conquista encontrada nesta categoria.
        </div>
      </div>
    );
  }

  // Handle achievement click
  const handleClick = (achievement: Achievement) => {
    if (onAchievementClick) {
      onAchievementClick(achievement);
    }
  };

  return (
    <div className="premium-card mb-6">
      <h3 className="text-xl font-orbitron font-bold mb-4 p-4 border-b border-divider/30 text-text-primary">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            id={achievement.id}
            title={achievement.name}
            description={achievement.description}
            xpReward={achievement.xpReward}
            points={achievement.points}
            iconName={achievement.iconName}
            status={achievement.isUnlocked ? 'unlocked' : 'locked'}
            rank={achievement.rank}
            category={achievement.category}
            onClick={() => handleClick(achievement)}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementGrid;
