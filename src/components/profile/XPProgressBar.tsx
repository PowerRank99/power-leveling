
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
  className = "bg-gradient-to-r from-arcane-60 to-valor-60"
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-full mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-space text-text-secondary">{label}</span>
        <span className="text-sm font-space font-medium text-text-primary">{current}/{total}</span>
      </div>
      
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default XPProgressBar;
