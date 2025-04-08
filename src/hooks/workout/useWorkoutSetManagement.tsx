
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useSetManagement } from './useSetManagement';
import { toast } from 'sonner';

/**
 * Hook responsible for set management operations
 */
export const useWorkoutSetManagement = (
  workoutId: string | null, 
  exercises: WorkoutExercise[],
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>,
  routineId: string
) => {
  const { updateSet: updateSetAction, addSet: addSetAction, removeSet: removeSetAction } = useSetManagement(workoutId);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const handleUpdateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    const result = await updateSetAction(exerciseIndex, exercises, setIndex, data);
    if (result) {
      setExercises(result);
      return true;
    }
    return false;
  };
  
  const handleAddSet = async (exerciseIndex: number) => {
    console.log(`useWorkoutSetManagement.handleAddSet called with exerciseIndex=${exerciseIndex}, routineId=${routineId}`);
    try {
      const result = await addSetAction(exerciseIndex, exercises, routineId);
      if (result) {
        console.log(`Set added successfully for exercise ${exerciseIndex}, updating exercises state`);
        setExercises(result);
        return true;
      } else {
        console.error("Failed to add set, no result returned");
        return false;
      }
    } catch (error) {
      console.error("Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return false;
    }
  };
  
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    const result = await removeSetAction(exerciseIndex, exercises, setIndex, routineId);
    if (result) {
      setExercises(result);
      return true;
    }
    return false;
  };
  
  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    const currentExercise = exercises[exerciseIndex];
    if (!currentExercise) return false;
    
    const currentSet = currentExercise.sets[setIndex];
    if (!currentSet) return false;
    
    const newCompleted = !currentSet.completed;
    
    console.log(`Marking set ${setIndex} for exercise ${exerciseIndex} as completed=${newCompleted}`);
    
    return handleUpdateSet(exerciseIndex, setIndex, { completed: newCompleted });
  };

  return {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex,
    setCurrentExerciseIndex
  };
};
