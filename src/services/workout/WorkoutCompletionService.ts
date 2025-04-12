
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StreakService } from '../rpg/StreakService';
import { XPService } from '../rpg/XPService';
import { PersonalRecordService } from '../rpg/PersonalRecordService';
import { AchievementCheckerService } from '../rpg/achievements/AchievementCheckerService';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { WorkoutExercise, WorkoutSet } from '@/types/workoutTypes';

export class WorkoutCompletionService {
  /**
   * Complete a workout with all related services
   */
  static async completeWorkout(
    userId: string, 
    workoutId: string,
    durationSeconds: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !workoutId) {
          throw new Error('userId and workoutId are required');
        }
        
        // Get the workout data
        const { data: workout, error: fetchError } = await supabase
          .from('workouts')
          .select(`
            id,
            user_id,
            routine_id,
            started_at,
            duration_seconds,
            workout_sets (
              id,
              exercise_id,
              reps,
              weight,
              completed
            )
          `)
          .eq('id', workoutId)
          .single();
        
        if (fetchError || !workout) {
          throw new Error('Error fetching workout data: ' + fetchError?.message);
        }
        
        // Mark workout as completed
        const { error: updateError } = await supabase
          .from('workouts')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds
          })
          .eq('id', workoutId);
        
        if (updateError) {
          throw new Error('Error marking workout as completed: ' + updateError.message);
        }
        
        // Execute all post-workout operations
        await Promise.allSettled([
          // 1. Update user streak
          StreakService.updateStreak(userId),
          
          // 2. Award XP for the workout
          XPService.awardWorkoutXP(userId, workout, durationSeconds),
          
          // 3. Check for personal records
          PersonalRecordService.checkForPersonalRecords(userId, {
            id: workoutId,
            exercises: workout.workout_sets.map(set => ({
              id: set.id,
              name: 'Exercise',
              exerciseId: set.exercise_id,
              sets: [{
                id: set.id,
                weight: set.weight?.toString() || '0',
                reps: set.reps?.toString() || '0',
                completed: Boolean(set.completed)
              }] as WorkoutSet[]
            })) as WorkoutExercise[],
            durationSeconds
          }).then(async (result) => {
            if (result.success && result.data && result.data.length > 0) {
              // Record personal records
              for (const record of result.data) {
                await PersonalRecordService.recordPersonalRecord(
                  userId,
                  record.exerciseId,
                  record.weight,
                  record.previousWeight
                );
              }
            }
          }),
          
          // 4. Check achievements
          AchievementCheckerService.checkWorkoutRelatedAchievements(userId)
        ]);
        
        // Show completion toast
        toast.success('Treino concluído com sucesso!', {
          description: 'Muito bem! Seus dados foram salvos.'
        });
        
        return true;
      },
      'COMPLETE_WORKOUT',
      {
        userMessage: 'Erro ao finalizar treino'
      }
    );
  }

  /**
   * Finish a workout
   * @param workoutId ID of the workout to finish
   * @param durationSeconds Duration of the workout in seconds
   * @returns Success status
   */
  static async finishWorkout(workoutId: string, durationSeconds: number): Promise<boolean> {
    try {
      // Get user ID from workout
      const { data: workout, error: fetchError } = await supabase
        .from('workouts')
        .select('user_id')
        .eq('id', workoutId)
        .single();
        
      if (fetchError || !workout) {
        console.error('Error fetching workout for finishWorkout:', fetchError);
        return false;
      }
      
      const userId = workout.user_id;
      
      // Use completeWorkout method to handle all the logic
      const result = await this.completeWorkout(userId, workoutId, durationSeconds);
      
      return result.success;
    } catch (error) {
      console.error('Error in finishWorkout:', error);
      return false;
    }
  }
  
  /**
   * Discard a workout
   * @param workoutId ID of the workout to discard
   * @returns Success status
   */
  static async discardWorkout(workoutId: string): Promise<boolean> {
    try {
      if (!workoutId) {
        console.error('No workout ID provided to discardWorkout');
        return false;
      }
      
      // Delete all workout sets first
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        return false;
      }
      
      // Delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error('Error deleting workout:', workoutError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in discardWorkout:', error);
      return false;
    }
  }
}
