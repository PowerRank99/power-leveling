
import React from 'react';
import ExerciseCard from './ExerciseCard';
import EmptyState from '@/components/ui/EmptyState';
import { Exercise } from './types/Exercise';

interface ExerciseListProps {
  exercises: Exercise[];
  hasActiveFilters: boolean;
  searchQuery: string;
  equipmentFilter: string;
  muscleFilter: string;
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  hasActiveFilters,
  searchQuery,
  equipmentFilter,
  muscleFilter,
  onSelectExercise 
}) => {
  if (exercises.length === 0) {
    return (
      <EmptyState message={
        searchQuery ? 
        `Nenhum exercício encontrado para "${searchQuery}"${equipmentFilter !== 'Todos' ? ` com ${equipmentFilter}` : ''}${muscleFilter !== 'Todos' ? ` para ${muscleFilter}` : ''}.` : 
        "Nenhum exercício encontrado com os filtros selecionados."
      } />
    );
  }

  return (
    <div>
      {hasActiveFilters && (
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {exercises.length} resultado{exercises.length !== 1 ? 's' : ''}
        </h3>
      )}
      {exercises.map(exercise => (
        <div 
          key={exercise.id} 
          className="cursor-pointer" 
          onClick={() => onSelectExercise(exercise)}
        >
          <ExerciseCard
            name={exercise.name}
            category={exercise.category}
            level={exercise.level as any}
            image={exercise.image_url || '/placeholder.svg'}
            description={exercise.description}
            equipment={exercise.equipment}
            muscleGroup={exercise.muscle_group}
            equipmentType={exercise.equipment_type}
          />
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
