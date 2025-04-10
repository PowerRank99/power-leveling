
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface WorkoutProgressBarProps {
  currentExerciseIndex: number;
  totalExercises: number;
}

const WorkoutProgressBar: React.FC<WorkoutProgressBarProps> = ({ 
  currentExerciseIndex, 
  totalExercises 
}) => {
  const progressPercentage = totalExercises > 0 
    ? Math.floor(((currentExerciseIndex + 1) / totalExercises) * 100) 
    : 0;
  
  const isAlmostComplete = progressPercentage >= 75;
  
  return (
    <div className="bg-white dark:bg-midnight/50">
      <div className="text-xs font-ibm-plex text-right pr-2 text-gray-500 dark:text-gray-400 flex justify-end items-center">
        <span className={isAlmostComplete ? 'text-xpgold animate-pulse' : ''}>
          {currentExerciseIndex + 1}
        </span>
        <span>/{totalExercises}</span>
      </div>
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-1.5 rounded-none bg-gray-200 dark:bg-midnight-dark/50"
          indicatorColor={`${isAlmostComplete ? 'bg-gradient-to-r from-valor to-xpgold' : 'bg-arcane'}`}
          showAnimation={isAlmostComplete}
        />
        
        {/* Add subtle glow effect when close to completion */}
        {isAlmostComplete && (
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              boxShadow: '0 0 4px rgba(250, 204, 21, 0.7)',
              filter: 'blur(1px)'
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
