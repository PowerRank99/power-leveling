
import React from 'react';
import { X } from 'lucide-react';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { Exercise, ExerciseType } from '@/components/workout/types/Exercise';

interface SelectedExerciseDisplayProps {
  exercise: Exercise;
  onClearSelection: () => void;
}

const SelectedExerciseDisplay: React.FC<SelectedExerciseDisplayProps> = ({
  exercise,
  onClearSelection,
}) => {
  return (
    <div className="relative">
      <ExerciseCard
        name={exercise.name}
        category={exercise.muscle_group || 'Não especificado'}
        type={(exercise.type || 'Força') as ExerciseType}
        image={exercise.image_url || '/placeholder.svg'}
        description={exercise.description || ''}
        equipment={exercise.equipment_type || 'Não especificado'}
        muscleGroup={exercise.muscle_group || 'Não especificado'}
        equipmentType={exercise.equipment_type || 'Não especificado'}
        disableExpand={true}
      />
      <button 
        className="absolute top-3 right-3 bg-arcane-30 text-text-primary p-2 rounded-full"
        onClick={onClearSelection}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SelectedExerciseDisplay;
