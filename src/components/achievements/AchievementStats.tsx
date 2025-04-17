
import React from 'react';
import { Progress } from '@/components/ui/progress';
import Trophy from '@/components/icons/Trophy';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementStatsProps {
  totalCount: number;
  unlockedCount: number;
  loading?: boolean;
}

const AchievementStats: React.FC<AchievementStatsProps> = ({ 
  totalCount,
  unlockedCount,
  loading = false
}) => {
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  
  if (loading) {
    return (
      <div className="premium-card mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Skeleton className="w-5 h-5 mr-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          
          <Skeleton className="h-2.5 w-full my-2" />
          
          <div className="flex justify-between mt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="premium-card mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Trophy className="text-achievement w-5 h-5 mr-2" />
            <h2 className="text-lg font-bold font-orbitron text-text-primary">Progresso das Conquistas</h2>
          </div>
          <div className="text-lg font-medium">
            <span className="text-achievement font-space">{unlockedCount}</span>
            <span className="text-text-tertiary font-space">/{totalCount}</span>
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-2.5 bg-midnight-elevated" 
        />
        
        <div className="flex justify-between mt-1 text-sm text-text-secondary font-sora">
          <span>{percentage}% completo</span>
          <span>{totalCount - unlockedCount} restantes</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementStats;
