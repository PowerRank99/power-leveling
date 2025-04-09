
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
  className = "bg-fitblue"
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{current}/{total}</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2.5" 
      />
    </div>
  );
};

export default XPProgressBar;
