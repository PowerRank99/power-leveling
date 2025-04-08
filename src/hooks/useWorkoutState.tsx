
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workout';

export const useWorkoutState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  return {
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    exercises,
    setExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    workoutId,
    setWorkoutId,
    isInitialized,
    setIsInitialized,
    isLocalSubmitting,
    setIsLocalSubmitting
  };
};
