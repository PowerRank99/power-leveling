
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Achievement, AchievementRank } from '@/types/achievementTypes';
import AchievementRankSection from './AchievementRankSection';

interface AchievementsRankListProps {
  achievements: Achievement[];
  expandedRank: string | null;
  onToggleRank: (rank: string) => void;
}

const AchievementsRankList: React.FC<AchievementsRankListProps> = ({
  achievements,
  expandedRank,
  onToggleRank
}) => {
  const ranks = [
    AchievementRank.S, 
    AchievementRank.A, 
    AchievementRank.B, 
    AchievementRank.C, 
    AchievementRank.D, 
    AchievementRank.E
  ];

  const achievementsByRank = useCallback(() => {
    const grouped: Record<string, Achievement[]> = {};
    
    ranks.forEach(rank => {
      const rankAchievements = achievements.filter(a => a.rank === rank);
      if (rankAchievements.length > 0) {
        grouped[rank] = rankAchievements;
      }
    });
    
    return grouped;
  }, [achievements]);

  return (
    <>
      {Object.entries(achievementsByRank()).map(([rank, items]) => (
        <AchievementRankSection 
          key={rank}
          rank={rank}
          achievements={items}
          isExpanded={expandedRank === rank}
          onToggle={() => onToggleRank(rank)}
        />
      ))}
      
      {achievements.length > 0 && (
        <motion.div 
          className="text-center mt-8 mb-4 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-text-tertiary italic font-sora text-sm">
            "Muitas conquistas ainda permanecem ocultas, aguardando para serem reveladas..."
          </p>
        </motion.div>
      )}
    </>
  );
};

export default AchievementsRankList;
