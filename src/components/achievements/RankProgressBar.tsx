
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RankBadge from './RankBadge';

interface RankProgressBarProps {
  currentRank: string;
  nextRank: string | null;
  pointsToNextRank: number | null;
  currentPoints: number;
}

const RankProgressBar: React.FC<RankProgressBarProps> = ({
  currentRank,
  nextRank,
  pointsToNextRank,
  currentPoints
}) => {
  // If at max rank, show completed bar
  if (!nextRank || !pointsToNextRank) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <RankBadge rank={currentRank} />
          <span className="text-sm font-space text-achievement">
            Rank Máximo Alcançado
          </span>
        </div>
        <div className="w-full h-2 bg-midnight-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-achievement to-achievement-60"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, (100 - (pointsToNextRank / (currentPoints + pointsToNextRank) * 100))));
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <RankBadge rank={currentRank} />
          <span className="text-text-tertiary font-sora text-sm">→</span>
          <RankBadge rank={nextRank} />
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-space text-text-secondary cursor-help">
                {pointsToNextRank} pontos para o próximo rank
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs font-sora">
                Ganhe pontos de conquista desbloqueando novas conquistas
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="relative w-full h-2 bg-midnight-elevated rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            currentRank === 'A' 
              ? 'bg-gradient-to-r from-valor to-achievement'
              : currentRank === 'B'
                ? 'bg-gradient-to-r from-arcane-60 to-valor'
                : 'bg-gradient-to-r from-arcane to-arcane-60'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export default RankProgressBar;
