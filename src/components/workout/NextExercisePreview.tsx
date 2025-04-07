
import React from 'react';
import { WorkoutExercise } from '@/hooks/useWorkout';

interface NextExercisePreviewProps {
  nextExercise: WorkoutExercise;
  currentIndex: number;
  totalExercises: number;
  onSkip: () => void;
}

const NextExercisePreview: React.FC<NextExercisePreviewProps> = ({ 
  nextExercise, 
  currentIndex, 
  totalExercises, 
  onSkip 
}) => {
  if (!nextExercise) return null;
  
  return (
    <div className="bg-white p-4 border-t border-gray-200 mt-4">
      <p className="text-gray-500 mb-2">Próximo Exercício</p>
      
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{nextExercise.name}</h3>
          <p className="text-sm text-gray-500">{currentIndex + 2}/{totalExercises}</p>
        </div>
        
        <button 
          className="text-fitblue font-medium"
          onClick={onSkip}
        >
          Pular
        </button>
      </div>
    </div>
  );
};

export default NextExercisePreview;
