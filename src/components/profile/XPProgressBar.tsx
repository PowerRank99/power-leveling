
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

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
  className = '',
  showXpRemaining = false,
  nextLevel
}) => {
  // Calculate percentage (cap at 100%)
  const percentage = Math.min((current / total) * 100, 100);
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };
  
  // Display for max level or XP to next level
  const getRemainingXPDisplay = () => {
    if (total === Infinity) {
      return 'Nível máximo';
    }
    return `${formatNumber(total - current)} XP para o ${nextLevel}`;
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-sora text-text-secondary">{label}</span>
        
        {showXpRemaining && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <span className="text-xs font-space text-text-tertiary">
                    {total - current > 0 ? getRemainingXPDisplay() : 'Nível máximo'}
                  </span>
                  <Info className="h-3 w-3 ml-1 text-text-tertiary" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-sora text-xs">
                <p>{current} / {total !== Infinity ? total : 'MAX'} XP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="w-full h-2 bg-midnight-elevated rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-arcane to-valor"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export default XPProgressBar;
