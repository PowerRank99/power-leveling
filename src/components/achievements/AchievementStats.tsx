
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
    <div className="bg-midnight-light/30 dark:bg-midnight-light/20 rounded-lg shadow-sm p-4 mb-4 border border-arcane/5 dark:border-arcane/10 transform transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-1.5 rounded-full ${isHighProgress ? 'bg-gradient-to-br from-valor-muted/90 to-xp-gold-muted/90' : 'bg-arcane/15'} mr-2`}>
            <Trophy className={`${isHighProgress ? 'text-white/95' : 'text-arcane-muted/90'} w-4 h-4`} />
          </div>
          <h2 className="text-base font-orbitron font-medium dark:text-ghostwhite/90">Progresso das Conquistas</h2>
        </div>
        <div className="text-base font-medium font-ibm-plex">
          <span className={`${isHighProgress ? 'text-xp-gold-muted' : 'text-fitgreen-600 dark:text-restgreen/90'}`}>
            {unlockedCount}
          </span>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-400 dark:text-gray-500">{totalCount}</span>
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-1.5 bg-gray-100/10 dark:bg-midnight-dark/40 rounded-full" 
          indicatorColor={`bg-gradient-to-r ${isHighProgress ? 'from-valor-muted to-xp-gold-muted' : 'from-arcane-muted/90 to-energy-muted/90'}`}
          showAnimation={isHighProgress}
        />
        
        {/* Subtle glow effect for high progress */}
        {isHighProgress && (
          <div 
            className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
            style={{
              boxShadow: '0 0 4px #FACC15',
              filter: 'blur(1px)'
            }}
          ></div>
        )}
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400/80">
        <span className="font-ibm-plex flex items-center">
          {percentage}% completo
          {isHighProgress && <Sparkles className="w-2.5 h-2.5 ml-1 text-xp-gold-muted opacity-70" />}
        </span>
        <span className="font-ibm-plex">{totalCount - unlockedCount} restantes</span>
      </div>
    </div>
  );
};

export default AchievementStats;
