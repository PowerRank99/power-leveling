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
   * Saves exercise history based on workout data, accounting for all sets
   * This is the primary method for updating exercise history
   */
  const saveExerciseHistory = async (workoutId: string) => {
    try {
      console.log("[useWorkoutCompletion] Saving comprehensive exercise history");
      
      // First, get all sets from this workout (both completed and non-completed)
      const { data: allSets, error: allSetsError } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, completed, set_order')
        .eq('workout_id', workoutId)
        .order('exercise_id, set_order');
        
      if (allSetsError || !allSets) {
        console.error("Error fetching all workout sets:", allSetsError);
        return;
      }
      
      console.log(`[useWorkoutCompletion] Processing ${allSets.length} sets for history update`);
      
      // Group sets by exercise
      const exerciseMap: Record<string, { 
        maxWeight: number, 
        typicalReps: number, 
        totalSets: number,
        completedSets: number,
        weights: number[],
        reps: number[]
      }> = {};
      
      // Process all sets to build a complete picture
      allSets.forEach(set => {
        if (!set.exercise_id) return;
        
        if (!exerciseMap[set.exercise_id]) {
          exerciseMap[set.exercise_id] = {
            maxWeight: 0,
            typicalReps: 0,
            totalSets: 0,
            completedSets: 0,
            weights: [],
            reps: []
          };
        }
        
        const record = exerciseMap[set.exercise_id];
        record.totalSets++;
        
        // Track the weight and reps, even for non-completed sets
        if (set.weight) {
          record.weights.push(Number(set.weight));
          // Keep track of max weight regardless of completion status
          if (Number(set.weight) > record.maxWeight) {
            record.maxWeight = Number(set.weight);
          }
        }
        
        if (set.reps) {
          record.reps.push(Number(set.reps));
        }
        
        // Count completed sets separately
        if (set.completed) {
          record.completedSets++;
        }
      });
      
      // Process and save history for each exercise
      for (const [exerciseId, data] of Object.entries(exerciseMap)) {
        // Calculate typical reps based on the mode (most common value)
        // or average if no mode is obvious
        let typicalReps = 12; // Default
        
        if (data.reps.length > 0) {
          // Find the mode (most common reps value)
          const repsCount: Record<number, number> = {};
          let maxCount = 0;
          let modeReps = 0;
          
          data.reps.forEach(rep => {
            repsCount[rep] = (repsCount[rep] || 0) + 1;
            if (repsCount[rep] > maxCount) {
              maxCount = repsCount[rep];
              modeReps = rep;
            }
          });
          
          typicalReps = modeReps || Math.round(data.reps.reduce((sum, rep) => sum + rep, 0) / data.reps.length);
        }
        
        console.log(`[useWorkoutCompletion] Updating history for exercise ${exerciseId}:`, {
          maxWeight: data.maxWeight,
          typicalReps,
          totalSets: data.totalSets
        });
        
        // Update the exercise history using our comprehensive data
        await ExerciseHistoryService.updateExerciseHistory(
          exerciseId,
          data.maxWeight,
          typicalReps,
          data.totalSets // Use the total set count, not just completed sets
        );
      }
    } catch (error) {
      console.error("[useWorkoutCompletion] Error saving exercise history:", error);
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
      
      // Save comprehensive exercise history based on all sets
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
