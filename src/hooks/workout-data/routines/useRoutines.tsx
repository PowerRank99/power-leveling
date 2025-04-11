
import { useState } from 'react';
import { Routine } from '../../types/workoutDataTypes';
import { useRoutineDeletion } from './useRoutineDeletion';

export const useRoutines = (userId: string | undefined) => {
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const { deleteRoutine, isDeletingRoutine } = useRoutineDeletion(userId);

  return {
    savedRoutines,
    setSavedRoutines,
    deleteRoutine: async (routineId: string) => {
      const success = await deleteRoutine(routineId);
      if (success) {
        // Update the UI by removing the deleted routine from state
        setSavedRoutines(prevRoutines => 
          prevRoutines.filter(routine => routine.id !== routineId)
        );
      }
      return success;
    },
    isDeletingRoutine
  };
};
