
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
  
  return (
    <div className="w-full mb-3 relative">
      <div className="flex justify-between mb-1 items-center">
        <span className="text-sm text-gray-400 dark:text-gray-300 font-sora font-medium">{label}</span>
        <div className="flex items-center">
          {showSparkle && percentage >= 80 && (
            <Sparkles className="w-4 h-4 text-xpgold animate-pulse mr-1" />
          )}
          <span className="text-sm font-medium font-space-grotesk tracking-wider">
            {current}/{total}
          </span>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2.5 dark:bg-midnight-light/50 rounded-full overflow-hidden" 
        indicatorColor={className} 
        showAnimation={true}
      />
      
      {showSparkle && percentage >= 50 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-xpgold font-space-grotesk">
          {percentage}% complete
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
