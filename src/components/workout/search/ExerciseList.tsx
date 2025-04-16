
import React from 'react';
import ExerciseCard from '../ExerciseCard';
import { Exercise } from '../types/Exercise';

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
      <div className="text-center py-6">
        {hasActiveFilters ? (
          <div>
            <p className="text-gray-500 mb-1">Nenhum exercício encontrado com os filtros:</p>
            <ul className="text-sm text-gray-400 mt-2">
              {searchQuery && <li>Busca: "{searchQuery}"</li>}
              {equipmentFilter !== 'Todos' && <li>Equipamento: {equipmentFilter}</li>}
              {muscleFilter !== 'Todos' && <li>Músculo: {muscleFilter}</li>}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">
            Nenhum exercício encontrado. Tente usar termos diferentes ou limpar os filtros.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {exercises.map(exercise => (
        <div 
          key={exercise.id} 
          className="cursor-pointer" 
          onClick={() => onSelectExercise(exercise)}
        >
          <ExerciseCard
            name={exercise.name}
            category={exercise.muscle_group || 'Não especificado'}
            level={exercise.level as any}
            type={exercise.type || 'Musculação'}
            image={exercise.image_url || '/placeholder.svg'}
            description={exercise.description || ''}
            equipment={exercise.equipment_type || 'Não especificado'}
            muscleGroup={exercise.muscle_group || 'Não especificado'}
            equipmentType={exercise.equipment_type || 'Não especificado'}
          />
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
