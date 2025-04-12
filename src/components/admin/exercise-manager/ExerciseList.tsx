
import React from 'react';
import { Exercise } from '@/components/workout/types/Exercise';
import ExerciseEditor from '@/components/admin/exercise-editor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface ExerciseListProps {
  exercises: Exercise[];
  isLoading: boolean;
  searchTerm: string;
  onConfirmDelete: (id: string) => void;
  onUpdate: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  isLoading,
  searchTerm,
  onConfirmDelete,
  onUpdate
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Carregando exercícios..." />;
  }
  
  if (exercises.length === 0) {
    return (
      <EmptyState 
        title="Não há exercícios encontrados"
        description={searchTerm ? "Tente outros termos de busca" : "Use o importador de exercícios para adicionar."}
      />
    );
  }
  
  return (
    <div className="space-y-3">
      {exercises.map(exercise => (
        <ExerciseEditor
          key={exercise.id}
          exercise={exercise}
          onDelete={onConfirmDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default ExerciseList;
