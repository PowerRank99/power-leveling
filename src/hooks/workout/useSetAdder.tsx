
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';
import { SetService } from '@/services/SetService';
import { useState } from 'react';

export const useSetAdder = (workoutId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const addSet = async (
    exerciseIndex: number, 
    exercises: WorkoutExercise[], 
    routineId: string
  ) => {
    if (isProcessing) return null;
    
    if (!workoutId || !exercises[exerciseIndex]) {
      toast.error("Erro ao adicionar série", {
        description: "Treino ou exercício não encontrado"
      });
      return null;
    }
    
    try {
      setIsProcessing(true);
      const currentExercise = exercises[exerciseIndex];
      console.log(`[useSetAdder] Adding set to exercise ${currentExercise.name} (ID: ${currentExercise.id})`);
      
      // Get current sets from the exercise
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      // First, get the actual count of sets in the database
      const countResult = await SetService.countSetsForExercise(
        workoutId,
        currentExercise.id
      );
      
      if (!countResult.success) {
        console.error("[useSetAdder] Failed to get current set count:", countResult.error);
        toast.error("Erro ao adicionar série", {
          description: "Não foi possível verificar o número atual de séries"
        });
        return null;
      }
      
      const actualSetCount = countResult.data!;
      console.log(`[useSetAdder] Current set count in database: ${actualSetCount}`);
      console.log(`[useSetAdder] Current set count in UI state: ${currentSets.length}`);
      
      // Calculate new set order based on actual database count
      const newSetOrder = actualSetCount;
      console.log(`[useSetAdder] New set will have order: ${newSetOrder}`);
      
      // Convert values to correct types for database
      const weightValue = lastSet ? parseFloat(lastSet.weight) || 0 : 0;
      const repsValue = lastSet ? parseInt(lastSet.reps) || 12 : 12;
      
      // Create new set in database FIRST
      console.log(`[useSetAdder] Creating set in database: workout=${workoutId}, exercise=${currentExercise.id}, order=${newSetOrder}, weight=${weightValue}, reps=${repsValue}`);
      
      const createResult = await SetService.createSet(
        workoutId,
        currentExercise.id,
        newSetOrder,
        weightValue,
        repsValue,
        false
      );
      
      if (!createResult.success) {
        SetService.displayError("adicionar série", createResult.error);
        return exercises; // Return original exercises on error
      }
      
      const newSet = createResult.data!;
      console.log(`[useSetAdder] Successfully created set with ID: ${newSet.id}`);
      
      // Now update local state with the database-generated ID
      updatedExercises[exerciseIndex].sets.push({
        id: newSet.id,
        weight: String(newSet.weight || 0),
        reps: String(newSet.reps || 12),
        completed: false,
        set_order: newSet.set_order,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      });
      
      // Normalize set orders to ensure they're sequential
      await SetService.normalizeSetOrders(workoutId, currentExercise.id);
      
      // Count sets again to verify our operation was successful
      const verificationResult = await SetService.countSetsForExercise(
        workoutId,
        currentExercise.id
      );
      
      if (verificationResult.success) {
        const newCount = verificationResult.data!;
        console.log(`[useSetAdder] Verification: database now has ${newCount} sets`);
        console.log(`[useSetAdder] UI state now has ${updatedExercises[exerciseIndex].sets.length} sets`);
        
        // Verify the counts match
        if (newCount !== updatedExercises[exerciseIndex].sets.length) {
          console.warn(`[useSetAdder] Count mismatch: DB=${newCount}, UI=${updatedExercises[exerciseIndex].sets.length}`);
        }
        
        // Update the routine exercise set count for persistence
        if (routineId) {
          console.log(`[useSetAdder] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${newCount}`);
          
          const updateResult = await SetService.updateRoutineExerciseSetsCount(
            routineId,
            currentExercise.id,
            newCount
          );
          
          if (!updateResult.success) {
            console.error(`[useSetAdder] Failed to update target sets count: ${JSON.stringify(updateResult.error)}`);
          } else {
            // Verify the update was successful
            const routineVerificationResult = await SetService.verifyRoutineExerciseSetsCount(
              routineId,
              currentExercise.id
            );
            
            if (routineVerificationResult.success) {
              console.log(`[useSetAdder] Verification: routine_exercises.target_sets = ${routineVerificationResult.data}`);
            }
          }
        }
      }
      
      return updatedExercises;
    } catch (error) {
      console.error("[useSetAdder] Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    addSet,
    isProcessing 
  };
};
