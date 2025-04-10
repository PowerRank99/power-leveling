
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
    <div className="bg-white">
      <div className="text-xs font-ibm-plex text-right pr-2 text-gray-500">
        {currentExerciseIndex + 1}/{totalExercises}
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-1 rounded-none bg-gray-200"
      />
    </div>
  );
};

export default WorkoutProgressBar;
