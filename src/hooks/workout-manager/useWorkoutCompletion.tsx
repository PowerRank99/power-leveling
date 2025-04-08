
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';

/**
 * Hook for handling workout completion and saving history
 */
export const useWorkoutCompletion = (
  workoutId: string | null, 
  elapsedTime: number,
  navigate: NavigateFunction
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Saves exercise history based on completed workout data
   */
  const saveExerciseHistory = async (workoutId: string) => {
    try {
      // Get all completed sets from this workout
      const { data: completedSets, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, completed')
        .eq('workout_id', workoutId)
        .eq('completed', true);

      if (error || !completedSets) {
        console.error("Error fetching completed sets:", error);
        return;
      }

      // Group and analyze sets by exercise
      const exerciseMap: Record<string, { maxWeight: number, avgReps: number, setCount: number, completedCount: number }> = {};

      // First get all exercises with their total set counts
      const { data: allSets, error: allSetsError } = await supabase
        .from('workout_sets')
        .select('exercise_id')
        .eq('workout_id', workoutId);
        
      if (allSetsError) {
        console.error("Error fetching all sets:", allSetsError);
      } else if (allSets) {
        // Count all sets per exercise
        allSets.forEach(set => {
          if (!set.exercise_id) return;
          
          if (!exerciseMap[set.exercise_id]) {
            exerciseMap[set.exercise_id] = {
              maxWeight: 0,
              avgReps: 0,
              setCount: 0,
              completedCount: 0
            };
          }
          
          exerciseMap[set.exercise_id].setCount++;
        });
      }

      // Now process completed sets
      completedSets.forEach(set => {
        if (!set.exercise_id) return;
        
        if (!exerciseMap[set.exercise_id]) {
          exerciseMap[set.exercise_id] = {
            maxWeight: 0,
            avgReps: 0,
            setCount: 1,  // Default to 1 if we couldn't get the total count
            completedCount: 0
          };
        }
        
        const record = exerciseMap[set.exercise_id];
        
        // Track max weight
        if (set.weight && set.weight > record.maxWeight) {
          record.maxWeight = Number(set.weight);
        }
        
        // Sum reps for average calculation
        record.avgReps += Number(set.reps || 0);
        record.completedCount++;
      });
      
      // Process and save history for each exercise
      for (const [exerciseId, data] of Object.entries(exerciseMap)) {
        if (data.completedCount === 0) continue;
        
        const avgReps = Math.round(data.avgReps / data.completedCount);
        
        await ExerciseHistoryService.updateExerciseHistory(
          exerciseId,
          data.maxWeight,
          avgReps,
          data.setCount  // Use the total set count, not just completed sets
        );
        
        console.log(`Exercise history updated for ${exerciseId}: weight=${data.maxWeight}, reps=${avgReps}, sets=${data.setCount}`);
      }
    } catch (error) {
      console.error("Error saving exercise history:", error);
    }
  };

  /**
   * Finishes and saves the current workout
   */
  const finishWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao finalizar treino", {
        description: "ID do treino não encontrado"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error: updateError } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Save exercise history based on the completed workout
      await saveExerciseHistory(workoutId);
      
      toast.success("Treino finalizado", {
        description: "Seu progresso foi salvo com sucesso!"
      });
      
      // Navigate back after success
      navigate('/treino');
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Não foi possível salvar o treino"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Discards the current workout
   */
  const discardWorkout = async () => {
    if (!workoutId) return;
    
    try {
      setIsSubmitting(true);
      
      await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      toast.info("Treino descartado");
      navigate('/treino');
    } catch (error) {
      console.error("Error discarding workout:", error);
      setIsSubmitting(false);
    }
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
}
