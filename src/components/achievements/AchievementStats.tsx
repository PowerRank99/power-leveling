
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from '@/components/icons/Trophy';

interface AchievementStatsProps {
  totalCount: number;
  unlockedCount: number;
}

const AchievementStats: React.FC<AchievementStatsProps> = ({ 
  totalCount,
  unlockedCount
}) => {
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Trophy className="text-fitblue-500 w-5 h-5 mr-2" />
          <h2 className="text-lg font-bold">Progresso das Conquistas</h2>
        </div>
        <div className="text-lg font-medium">
          <span className="text-fitgreen-600">{unlockedCount}</span>
          <span className="text-gray-400">/{totalCount}</span>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2.5 bg-gray-100" 
        indicatorColor="bg-gradient-to-r from-fitblue-400 to-fitgreen-400"
      />
      
      <div className="flex justify-between mt-1 text-sm text-gray-500">
        <span>{percentage}% completo</span>
        <span>{totalCount - unlockedCount} restantes</span>
      </div>
    </div>
  );
};

export default AchievementStats;
