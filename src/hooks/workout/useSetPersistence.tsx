
import { useState } from 'react';
import { SetService } from '@/services/SetService';
import { WorkoutExercise, SetData } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * A hook that provides reliable set persistence operations
 */
export function useSetPersistence(workoutId: string | null) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Updates a set with new data
   */
  const updateSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ) => {
    if (!workoutId || !exercises[exerciseIndex]) {
      toast.error("Erro ao atualizar série", {
        description: "Treino ou exercício não encontrado"
      });
      return null;
    }
    
    // Don't allow multiple operations simultaneously
    if (isProcessing) {
      console.log("[useSetPersistence] Another operation is in progress, skipping update");
      return null;
    }
    
    try {
      setIsProcessing(true);
      const currentExercise = exercises[exerciseIndex];
      const currentSet = currentExercise.sets[setIndex];
      
      if (!currentSet) {
        throw new Error(`Set not found at index ${setIndex} for exercise ${currentExercise.name}`);
      }
      
      console.log(`[useSetPersistence] Updating set for ${currentExercise.name}, set #${setIndex + 1}`, data);
      
      // If this is a temporary ID, create a new set in the database first
      if (currentSet.id.startsWith('default-') || currentSet.id.startsWith('new-')) {
        console.log(`[useSetPersistence] Creating new database record for temp set ID: ${currentSet.id}`);
        
        // Parse values for database
        const weightValue = parseFloat(data.weight ?? currentSet.weight) || 0;
        const repsValue = parseInt(data.reps ?? currentSet.reps) || 0;
        const completedValue = data.completed !== undefined ? data.completed : currentSet.completed;
        
        // Create the set in the database
        const createResult = await SetService.createSet(
          workoutId,
          currentExercise.id,
          setIndex, // Use consistent set order
          weightValue,
          repsValue,
          completedValue
        );
        
        if (!createResult.success) {
          SetService.displayError('salvar série', createResult.error);
          return exercises;
        }
        
        // Update our local state with the real database ID
        const updatedExercises = [...exercises];
        const setData = createResult.data!;
        
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...updatedExercises[exerciseIndex].sets[setIndex],
          id: setData.id,
          weight: data.weight ?? currentSet.weight,
          reps: data.reps ?? currentSet.reps,
          completed: data.completed ?? currentSet.completed,
          set_order: setIndex
        };
        
        return updatedExercises;
      } 
      // Regular update for existing database records
      else {
        // Prepare the data for update
        const updateData: { weight?: number; reps?: number; completed?: boolean } = {};
        
        if (data.weight !== undefined) {
          updateData.weight = parseFloat(data.weight) || 0;
        }
        
        if (data.reps !== undefined) {
          updateData.reps = parseInt(data.reps) || 0;
        }
        
        if (data.completed !== undefined) {
          updateData.completed = data.completed;
        }
        
        // Only update if we have something to change
        if (Object.keys(updateData).length > 0) {
          const updateResult = await SetService.updateSet(currentSet.id, updateData);
          
          if (!updateResult.success) {
            SetService.displayError('atualizar série', updateResult.error);
            return exercises;
          }
        }
        
        // Update local state with the new data
        const updatedExercises = [...exercises];
        
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...updatedExercises[exerciseIndex].sets[setIndex],
          ...data
        };
        
        return updatedExercises;
      }
    } catch (error) {
      console.error("[useSetPersistence] Error updating set:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível salvar as alterações"
      });
      return exercises;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Adds a new set to an exercise
   */
  const addSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    routineId: string
  ) => {
    if (!workoutId || !exercises[exerciseIndex]) {
      toast.error("Erro ao adicionar série", {
        description: "Treino ou exercício não encontrado"
      });
      return exercises;
    }
    
    // Don't allow multiple operations simultaneously
    if (isProcessing) {
      console.log("[useSetPersistence] Another operation is in progress, skipping add");
      return exercises;
    }
    
    try {
      setIsProcessing(true);
      const currentExercise = exercises[exerciseIndex];
      const currentSets = currentExercise.sets;
      const lastSet = currentSets.length > 0 ? currentSets[currentSets.length - 1] : null;
      
      // Calculate values for the new set
      const weightValue = lastSet ? parseFloat(lastSet.weight) || 0 : 0;
      const repsValue = lastSet ? parseInt(lastSet.reps) || 12 : 12;
      const newSetOrder = currentSets.length; // Simple incremental order
      
      console.log(`[useSetPersistence] Adding new set to ${currentExercise.name} with order=${newSetOrder}, weight=${weightValue}, reps=${repsValue}`);
      
      // Create the set in the database first
      const createResult = await SetService.createSet(
        workoutId,
        currentExercise.id,
        newSetOrder,
        weightValue,
        repsValue,
        false
      );
      
      if (!createResult.success) {
        SetService.displayError('adicionar série', createResult.error);
        return exercises;
      }
      
      const newSet = createResult.data!;
      console.log(`[useSetPersistence] Successfully added set with ID ${newSet.id}`);
      
      // Update local state with the new set
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets.push({
        id: newSet.id,
        weight: newSet.weight,
        reps: newSet.reps,
        completed: newSet.completed,
        set_order: newSet.set_order,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      });
      
      // Update the target_sets in routine_exercises for persistence in future workouts
      if (routineId) {
        console.log(`[useSetPersistence] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${currentSets.length + 1}`);
        
        const newSetsCount = currentSets.length + 1;
        await SetService.updateRoutineExerciseSetsCount(
          routineId,
          currentExercise.id,
          newSetsCount
        );
      } else {
        console.warn("[useSetPersistence] No routineId provided, cannot update target_sets in routine_exercises");
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("[useSetPersistence] Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return exercises;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Removes a set from an exercise
   */
  const removeSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    setIndex: number,
    routineId: string
  ) => {
    if (!workoutId || !exercises[exerciseIndex]) {
      toast.error("Erro ao remover série", {
        description: "Treino ou exercício não encontrado"
      });
      return exercises;
    }
    
    // Don't allow multiple operations simultaneously
    if (isProcessing) {
      console.log("[useSetPersistence] Another operation is in progress, skipping remove");
      return exercises;
    }
    
    try {
      setIsProcessing(true);
      const currentExercise = exercises[exerciseIndex];
      
      if (currentExercise.sets.length <= 1) {
        toast.error("Não é possível remover", {
          description: "Deve haver pelo menos uma série"
        });
        return exercises;
      }
      
      const setId = currentExercise.sets[setIndex].id;
      console.log(`[useSetPersistence] Removing set ${setIndex + 1} for exercise ${currentExercise.name}, ID: ${setId}`);
      
      // Update local state first
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = [
        ...currentExercise.sets.slice(0, setIndex),
        ...currentExercise.sets.slice(setIndex + 1)
      ];
      
      // Delete from database if it's a real record
      if (!setId.startsWith('default-') && !setId.startsWith('new-')) {
        const deleteResult = await SetService.deleteSet(setId);
        
        if (!deleteResult.success) {
          SetService.displayError('remover série', deleteResult.error);
          return exercises;
        }
        
        // Reorder the remaining sets in the database to maintain consistency
        await SetService.reorderSets(
          workoutId, 
          currentExercise.id, 
          updatedExercises[exerciseIndex].sets
        );
      }
      
      // Update the routine exercise set count for persistence in future workouts
      if (routineId) {
        console.log(`[useSetPersistence] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${currentExercise.sets.length - 1}`);
        
        await SetService.updateRoutineExerciseSetsCount(
          routineId,
          currentExercise.id,
          currentExercise.sets.length - 1
        );
      } else {
        console.warn("[useSetPersistence] No routineId provided, cannot update target_sets in routine_exercises");
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("[useSetPersistence] Error removing set:", error);
      toast.error("Erro ao remover série", {
        description: "Não foi possível remover a série"
      });
      return exercises;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    updateSet,
    addSet,
    removeSet,
    isProcessing
  };
}
