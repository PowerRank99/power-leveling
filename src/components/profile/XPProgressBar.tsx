
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface XPProgressBarProps {
  current: number;
  total: number;
  label: string;
  className?: string;
  showXpRemaining?: boolean;
  nextLevel?: number;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ 
  current, 
  total, 
  label,
  className = "bg-gradient-to-r from-arcane-60 to-valor-60",
  showXpRemaining = false,
  nextLevel
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const xpRemaining = total - current;
  
  return (
    <div className="w-full mb-2">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          {showXpRemaining && nextLevel && (
            <span className="text-sm font-space px-2 py-0.5 bg-arcane-15 text-arcane rounded-full border border-arcane-30 shadow-glow-subtle">
              Nível {nextLevel - 1}
            </span>
          )}
          <span className="text-sm font-sora text-text-secondary">{label}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-space font-medium text-arcane-60">{current}/{total}</span>
            </TooltipTrigger>
            {showXpRemaining && nextLevel && (
              <TooltipContent side="top">
                <p className="text-xs font-sora">{xpRemaining} XP para o Nível {nextLevel}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="h-1.5 bg-divider rounded-full overflow-hidden relative">
        <div 
          className={`h-full ${className} rounded-full transition-all duration-500 progress-bar-fill`} 
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.6), rgba(239, 68, 68, 0.6))' }}
        ></div>
      </div>

      {showXpRemaining && nextLevel && (
        <div className="mt-1 text-xs text-text-tertiary font-sora text-right">
          {xpRemaining} XP para o Nível {nextLevel}
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
