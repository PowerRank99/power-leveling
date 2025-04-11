
import React from 'react';
import ExerciseCard from '../ExerciseCard';
import EmptyState from '@/components/ui/EmptyState';
import { Exercise } from '../types/Exercise';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <EmptyState 
        title={
          searchQuery ? 
          `Nenhum exercício encontrado para "${searchQuery}"${equipmentFilter !== 'Todos' ? ` com ${equipmentFilter}` : ''}${muscleFilter !== 'Todos' ? ` para ${muscleFilter}` : ''}.` : 
          "Nenhum exercício encontrado com os filtros selecionados."
        }
        description="Tente ajustar os filtros ou a busca para encontrar exercícios."
      />
    );
  }

  // If there are more than 6 exercises, wrap them in a ScrollArea
  const shouldUseScrollArea = exercises.length > 6;
  
  const exerciseList = (
    <>
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
            type="Força" // Add default type
            image={exercise.image_url || '/placeholder.svg'}
            description={exercise.description || ''}
            equipment={exercise.equipment || ''}
            muscleGroup={exercise.muscle_group || exercise.category || 'Não especificado'}
            equipmentType={exercise.equipment_type || 'Não especificado'}
          />
        </div>
      ))}
    </>
  );

  if (shouldUseScrollArea) {
    return (
      <div>
        <ScrollArea className="h-[450px]">
          {exerciseList}
        </ScrollArea>
      </div>
    );
  }

  return <div>{exerciseList}</div>;
};

export default ExerciseList;
