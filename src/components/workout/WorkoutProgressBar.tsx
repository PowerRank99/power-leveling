
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
  
  return (
    <div className="bg-midnight-base border-b border-divider">
      <Progress 
        value={progressPercentage} 
        className="h-1 rounded-none"
      />
    </div>
  );
};

export default WorkoutProgressBar;
