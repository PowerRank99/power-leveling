
import React from 'react';

interface TimerProgressBarProps {
  progressPercentage: number;
}

const TimerProgressBar: React.FC<TimerProgressBarProps> = ({ progressPercentage }) => {
  // Ensure the percentage is between 0 and 100
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
      <div 
        className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" 
        style={{ width: `${clampedProgress}%` }} 
      />
    </div>
  );
};

export default TimerProgressBar;
