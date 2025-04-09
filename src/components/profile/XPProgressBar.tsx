
import React from 'react';

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
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        <span className="text-sm font-medium">{current}/{total}</span>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className={`${className} h-2.5 rounded-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default XPProgressBar;
