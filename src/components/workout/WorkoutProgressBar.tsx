
import React from 'react';

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
    <div className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="text-sm font-medium">
          Exercício {currentExerciseIndex + 1} de {totalExercises}
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700 font-medium">
          {progressPercentage}% completo
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 w-full">
        <div 
          className="h-1 bg-fitblue transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
