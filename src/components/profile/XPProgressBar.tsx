
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
        <span className="text-sm text-gray-400 dark:text-gray-300 font-sora font-medium">{label}</span>
        <div className="flex items-center">
          {showSparkle && isHighProgress && (
            <Sparkles className="w-4 h-4 text-xpgold animate-pulse mr-1" />
          )}
          <span className="text-sm font-medium font-ibm-plex tracking-wider">
            {current}/{total}
          </span>
        </div>
      </div>
      
      {/* Progress bar with enhanced animation */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2.5 dark:bg-midnight-light/50 rounded-full overflow-hidden" 
          indicatorColor={className} 
          showAnimation={true}
        />
        
        {/* Dynamic glow effect for high progress */}
        {isHighProgress && (
          <div 
            className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
            style={{
              boxShadow: '0 0 8px #FACC15',
              filter: 'blur(2px)',
              animation: 'glow-pulse 2s ease-in-out infinite'
            }}
          ></div>
        )}
      </div>
      
      {showSparkle && percentage >= 50 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-xpgold font-ibm-plex flex items-center">
          <span>{percentage}% complete</span>
          {percentage >= 90 && <Sparkles className="w-3 h-3 ml-1 animate-pulse" />}
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
