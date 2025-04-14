
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface AchievementStatsCardProps {
  stats: {
    total: number;
    unlocked: number;
    points: number;
    totalXp: number;
  };
}

const AchievementStatsCard: React.FC<AchievementStatsCardProps> = ({ stats }) => {
  return (
    <motion.div 
      className="premium-card mb-6 bg-midnight-card border border-divider/30 shadow-glow-subtle overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-divider/30">
        <h3 className="text-lg font-orbitron font-bold text-text-primary">Poder Revelado</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-sora">Conquistas Reveladas</span>
          <span className="font-space text-arcane font-bold">{stats.unlocked}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-sora">Pontos de Conquista</span>
          <div className="flex items-center">
            <span className="font-space text-achievement font-bold mr-1">{stats.points}</span>
            <Star className="h-4 w-4 text-achievement" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-sora">XP Total Ganho</span>
          <span className="font-space text-arcane font-bold">+{stats.totalXp} XP</span>
        </div>
        <div className="mt-2 text-xs text-text-tertiary font-sora italic">
          "Suas conquistas são apenas uma parte do seu verdadeiro potencial..."
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementStatsCard;
