
import React from 'react';
import { Trash2 } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import { Exercise, ExerciseType } from './types/Exercise';

interface SelectedExercisesListProps {
  exercises: Exercise[];
  onRemoveExercise: (index: number) => void;
}

const SelectedExercisesList: React.FC<SelectedExercisesListProps> = ({ exercises, onRemoveExercise }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">Exercícios ({exercises.length})</h2>
      
      {exercises.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          Nenhum exercício adicionado ainda
        </div>
      ) : (
        exercises.map((exercise, index) => (
          <div key={exercise.id} className="relative mb-3">
            <ExerciseCard
              name={exercise.name}
              category={exercise.muscle_group || 'Não especificado'}
              level={exercise.level as any}
              type={(exercise.type || 'Força') as ExerciseType}
              image={exercise.image_url || '/placeholder.svg'}
              description={exercise.description}
              equipment={exercise.equipment_type || 'Não especificado'}
              muscleGroup={exercise.muscle_group || 'Não especificado'}
              equipmentType={exercise.equipment_type || 'Não especificado'}
            />
            <button 
              className="absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full"
              onClick={() => onRemoveExercise(index)}
            >
              <Trash2 className="w-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SelectedExercisesList;
