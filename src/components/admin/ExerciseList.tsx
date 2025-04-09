
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ExerciseCard from '@/components/workout/ExerciseCard';
import EmptyState from '@/components/ui/EmptyState';
import { AdminExercise } from './types/exercise';

interface ExerciseListProps {
  exercises: AdminExercise[];
  selectedExercises: string[];
  isDeleting: string | null;
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => void;
  isFiltered: boolean;
  totalCount: number;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  selectedExercises,
  isDeleting,
  onToggleSelection,
  onDelete,
  isFiltered,
  totalCount
}) => {
  if (exercises.length === 0) {
    return (
      <EmptyState message={
        totalCount === 0 
          ? "Não há exercícios cadastrados ainda. Use o importador de exercícios para adicionar."
          : "Nenhum exercício corresponde aos filtros aplicados."
      } />
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map(exercise => (
        <div key={exercise.id} className="relative border rounded-lg">
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={selectedExercises.includes(exercise.id)}
              onCheckedChange={() => onToggleSelection(exercise.id)}
            />
          </div>
          
          <div className="pt-3 pl-10">
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
          
          <button 
            className={`absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full ${isDeleting === exercise.id ? 'opacity-50' : ''}`}
            onClick={() => onDelete(exercise.id)}
            disabled={isDeleting === exercise.id}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
