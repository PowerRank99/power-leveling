import React from 'react';
import { ArrowRight } from 'lucide-react';
import { WorkoutExercise } from '@/hooks/useWorkout';
import { Button } from '@/components/ui/button';

// This component is no longer needed in the new design,
// but we'll keep it for backward compatibility

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
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm mb-1">Próximo Exercício</p>
        <h3 className="font-medium text-lg">{nextExercise.name}</h3>
        <p className="text-sm text-gray-500">{currentIndex + 2}/{totalExercises}</p>
      </div>
      
      <Button 
        variant="ghost"
        onClick={onSkip}
        className="text-fitblue flex items-center gap-1"
      >
        Avançar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NextExercisePreview;
