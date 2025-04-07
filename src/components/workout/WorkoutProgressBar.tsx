
import React from 'react';

interface WorkoutProgressBarProps {
  currentExerciseIndex: number;
  totalExercises: number;
}

const WorkoutProgressBar: React.FC<WorkoutProgressBarProps> = ({ 
  currentExerciseIndex, 
  totalExercises 
}) => {
  const progressPercentage = Math.floor((currentExerciseIndex / totalExercises) * 100);
  
  return (
    <div className="bg-white p-2">
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-gray-500">
          Exercício {currentExerciseIndex + 1} de {totalExercises}
        </div>
        <div className="bg-fitblue-100 px-3 py-1 rounded-full text-xs text-fitblue font-medium">
          {progressPercentage}% completo
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
