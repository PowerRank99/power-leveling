
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
  colorClass = 'bg-fitblue'
}) => {
  const progress = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="w-full mb-4">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          {percentage && <span className="text-sm font-semibold">{progress}%</span>}
        </div>
      )}
      
      <div className="progress-bar">
        <div 
          className={`${colorClass} progress-value`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-sm text-gray-500">{current} {target > 1000 ? 'kg' : ''}</span>
        <span className="text-sm text-gray-500">/ {target} {target > 1000 ? 'kg' : ''}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
