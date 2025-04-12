
import React from 'react';
import { AchievementProgress } from '@/types/achievementTypes';

interface AchievementProgressBarProps {
  progress?: AchievementProgress;
  rank?: string;
  isUnlocked?: boolean;
  showValues?: boolean;
  className?: string;
}

const AchievementProgressBar: React.FC<AchievementProgressBarProps> = ({
  progress,
  rank = 'E',
  isUnlocked = false,
  showValues = true,
  className = ''
}) => {
  if (!progress) return null;
  
  // Calculate percentage with safeguards
  const percentage = progress.total > 0 
    ? Math.min(Math.round((progress.current / progress.total) * 100), 100) 
    : 0;
  
  // Determine colors based on rank
  let colors = {
    bg: 'bg-divider',
    fill: 'bg-text-tertiary',
    text: 'text-text-secondary'
  };
  
  if (isUnlocked) {
    colors.fill = 'bg-achievement';
    colors.text = 'text-achievement';
  } else {
    switch (rank) {
      case 'S':
        colors.fill = 'bg-achievement';
        colors.text = 'text-achievement';
        break;
      case 'A':
        colors.fill = 'bg-achievement-60';
        colors.text = 'text-achievement-60';
        break;
      case 'B':
        colors.fill = 'bg-valor';
        colors.text = 'text-valor';
        break;
      case 'C':
        colors.fill = 'bg-valor-60';
        colors.text = 'text-valor-60';
        break;
      case 'D':
        colors.fill = 'bg-arcane';
        colors.text = 'text-arcane';
        break;
      case 'E':
        colors.fill = 'bg-arcane-60';
        colors.text = 'text-arcane-60';
        break;
      default:
        colors.fill = 'bg-text-tertiary';
        colors.text = 'text-text-tertiary';
    }
  }
  
  return (
    <div className={`w-full ${className}`}>
      {showValues && (
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${colors.text} font-space`}>
            {progress.current}/{progress.total}
          </span>
          <span className={`text-xs ${colors.text} font-space`}>
            {percentage}%
          </span>
        </div>
      )}
      
      <div className={`w-full h-2 ${colors.bg} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colors.fill} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AchievementProgressBar;
