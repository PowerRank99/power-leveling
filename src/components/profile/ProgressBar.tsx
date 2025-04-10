
import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  percentage?: boolean;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  percentage = true,
  colorClass = 'bg-arcane'
}) => {
  const progress = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="w-full mb-4">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-ghost-500">{label}</span>
          {percentage && <span className="text-sm font-semibold font-mono">{progress}%</span>}
        </div>
      )}
      
      <div className="h-2 w-full bg-midnight-200/30 rounded-full overflow-hidden">
        <div 
          className={`${colorClass} h-full relative overflow-hidden rounded-full`} 
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-30"></div>
        </div>
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-sm text-ghost-500 font-mono">{current} {target > 1000 ? 'kg' : ''}</span>
        <span className="text-sm text-ghost-500 font-mono">/ {target} {target > 1000 ? 'kg' : ''}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
