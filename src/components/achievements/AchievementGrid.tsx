
import React from 'react';
import AchievementCard from './AchievementCard';
import { Achievement } from '@/services/rpg/AchievementService';

interface AchievementGridProps {
  achievements: Achievement[];
  title: string;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ achievements, title }) => {
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

  return (
    <div className="premium-card mb-6">
      <h3 className="text-xl font-orbitron font-bold mb-4 p-4 border-b border-divider/30 text-text-primary">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementGrid;
