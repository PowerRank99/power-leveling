
import React from 'react';
import ExerciseCard from '../ExerciseCard';
import { Exercise, ExerciseType, DifficultyLevel } from '../types/Exercise';

interface RecentExercisesProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

const RecentExercises: React.FC<RecentExercisesProps> = ({ exercises, onSelectExercise }) => {
  if (exercises.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Recentes</h3>
      {exercises.map(exercise => (
        <div 
          key={exercise.id} 
          className="cursor-pointer" 
          onClick={() => onSelectExercise(exercise)}
        >
          <ExerciseCard
            name={exercise.name}
            category={exercise.muscle_group || 'Não especificado'}
            level={exercise.level}
            type={(exercise.type || 'Musculação') as ExerciseType}
            image={exercise.image_url || '/placeholder.svg'}
            description={exercise.description}
            equipment={exercise.equipment_type || 'Não especificado'}
            muscleGroup={exercise.muscle_group || 'Não especificado'}
            equipmentType={exercise.equipment_type || 'Não especificado'}
          />
        </div>
      ))}
    </div>
  );
};

export default RecentExercises;
