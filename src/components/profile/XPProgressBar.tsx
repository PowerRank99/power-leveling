
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface XPProgressBarProps {
  current: number;
  total: number;
  label: string;
  className?: string;
  showSparkle?: boolean;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ 
  current, 
  total, 
  label,
  className = "bg-gradient-valor-xpgold",
  showSparkle = false
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const isHighProgress = percentage >= 80;
  
  return (
    <div className="w-full mb-3 relative">
      <div className="flex justify-between mb-1 items-center">
        <span className="text-xs text-gray-400 dark:text-gray-300 font-sora">{label}</span>
        <div className="flex items-center">
          {showSparkle && isHighProgress && (
            <Sparkles className="w-3 h-3 text-xp-gold opacity-80 mr-1" />
          )}
          <span className="text-sm font-medium font-ibm-plex tracking-wide">
            {current}/{total}
          </span>
        </div>
      </div>
      
      {/* Refined, thinner progress bar with subtle animation */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-1.5 dark:bg-midnight-light/20 rounded-full overflow-hidden" 
          indicatorColor={className} 
          showAnimation={isHighProgress}
        />
        
        {/* Subtle glow effect for high progress */}
        {isHighProgress && (
          <div 
            className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
            style={{
              boxShadow: '0 0 4px #FACC15',
              filter: 'blur(1px)',
              animation: 'glow-pulse 2.5s ease-in-out infinite'
            }}
          ></div>
        )}
      </div>
      
      {showSparkle && percentage >= 75 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-xp-gold/90 font-ibm-plex flex items-center">
          <span>{percentage}% complete</span>
          {percentage >= 90 && <Sparkles className="w-2.5 h-2.5 ml-1 opacity-80" />}
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
