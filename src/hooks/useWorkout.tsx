
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutSets } from './useWorkoutSets';
import { useWorkoutCompletion } from './useWorkoutCompletion';
import { useWorkoutExercises } from './useWorkoutExercises';

export type { WorkoutExercise } from '@/types/workout';

export const useWorkout = (routineId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { updateSet: updateSetAction, addSet: addSetAction } = useWorkoutSets(workoutId, exercises, currentExerciseIndex);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  const { fetchRoutineExercises } = useWorkoutExercises();

  useEffect(() => {
    const setupWorkout = async () => {
      try {
        setIsLoading(true);
        
        const { workoutExercises, workoutId: newWorkoutId } = await fetchRoutineExercises(routineId);
        
        if (workoutExercises && newWorkoutId) {
          setExercises(workoutExercises);
          setWorkoutId(newWorkoutId);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    setupWorkout();
  }, [routineId, fetchRoutineExercises]);
  
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = currentExerciseIndex < exercises.length - 1 
    ? exercises[currentExerciseIndex + 1] 
    : null;
  
  const updateSet = async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    const updatedExercises = await updateSetAction(setIndex, data);
    if (updatedExercises) {
      setExercises(updatedExercises);
    }
  };
  
  const addSet = async () => {
    const updatedExercises = await addSetAction();
    if (updatedExercises) {
      setExercises(updatedExercises);
    }
  };
  
  const goToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };
  
  const finishWorkout = async () => {
    return finishWorkoutAction(elapsedTime);
  };
  
  return {
    isLoading,
    exercises,
    currentExercise,
    nextExercise,
    currentExerciseIndex,
    totalExercises: exercises.length,
    updateSet,
    addSet,
    goToNextExercise,
    finishWorkout,
    elapsedTime,
    formatTime
  };
};
