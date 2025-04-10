
import React from 'react';
import { Progress } from '@/components/ui/progress';
import Trophy from '@/components/icons/Trophy';
import { Sparkles } from 'lucide-react';

interface AchievementStatsProps {
  totalCount: number;
  unlockedCount: number;
}

const AchievementStats: React.FC<AchievementStatsProps> = ({ 
  totalCount,
  unlockedCount
}) => {
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const isHighProgress = percentage >= 70;
  
  return (
    <div className="bg-white dark:bg-midnight-light/50 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-arcane/20 transform transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-1.5 rounded-full ${isHighProgress ? 'bg-gradient-valor-xpgold animate-pulse' : 'bg-fitblue-100 dark:bg-arcane/20'} mr-2`}>
            <Trophy className={`${isHighProgress ? 'text-white' : 'text-fitblue-500 dark:text-arcane'} w-5 h-5`} />
          </div>
          <h2 className="text-lg font-orbitron font-bold dark:text-ghostwhite">Progresso das Conquistas</h2>
        </div>
        <div className="text-lg font-medium font-ibm-plex">
          <span className={`${isHighProgress ? 'text-xpgold animate-pulse' : 'text-fitgreen-600 dark:text-restgreen'}`}>
            {unlockedCount}
          </span>
          <span className="text-gray-400 dark:text-gray-500">/{totalCount}</span>
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2.5 bg-gray-100 dark:bg-midnight-dark/50 rounded-full" 
          indicatorColor={`bg-gradient-to-r ${isHighProgress ? 'from-valor to-xpgold animate-shimmer bg-[length:200%_100%]' : 'from-fitblue-400 to-fitgreen-400'}`}
        />
        
        {/* Dynamic glow effect for high progress */}
        {isHighProgress && (
          <div 
            className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
            style={{
              boxShadow: '0 0 6px #FACC15',
              filter: 'blur(2px)',
              animation: 'glow-pulse 2s ease-in-out infinite'
            }}
          ></div>
        )}
      </div>
      
      <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-ibm-plex flex items-center">
          {percentage}% completo
          {isHighProgress && <Sparkles className="w-3 h-3 ml-1 text-xpgold" />}
        </span>
        <span className="font-ibm-plex">{totalCount - unlockedCount} restantes</span>
      </div>
    </div>
  );
};

export default AchievementStats;
