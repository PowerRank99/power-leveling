
import { useState, useEffect } from 'react';
import { Exercise } from '@/components/workout/types/Exercise';

export function useExerciseSearch(exercises: Exercise[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(term) || 
        (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(term)) ||
        (exercise.type && exercise.type.toLowerCase().includes(term))
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm, exercises]);

  return {
    searchTerm,
    setSearchTerm,
    filteredExercises
  };
}
