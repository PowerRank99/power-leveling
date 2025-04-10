
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface XPProgressBarProps {
  current: number;
  total: number;
  label: string;
  className?: string;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ 
  current, 
  total, 
  label,
  className = "bg-arcane"
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-full mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-ghost-300 font-medium">{label}</span>
        <span className="text-sm font-mono text-xpgold">{current}/{total}</span>
      </div>
      
      <Progress value={percentage} className="h-2.5" indicatorColor={className} />
    </div>
  );
};

export default XPProgressBar;
