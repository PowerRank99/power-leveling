
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { XPService } from '../rpg/XPService';
import { StreakService } from '../rpg/StreakService'; 
import { ExerciseHistoryService } from '../ExerciseHistoryService';
import { toast } from 'sonner';
import { PersonalRecordService, PersonalRecord } from '../rpg/PersonalRecordService';
import { AchievementCheckerService } from '../rpg/achievements/AchievementCheckerService';

/**
 * Service for handling workout completion
 */
export class WorkoutCompletionService {
  /**
   * Complete a workout and handle all related operations
   */
  static async completeWorkout(
    userId: string,
    workoutId: string,
    exercises: WorkoutExercise[],
    duration: number,
    notes?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!userId || !workoutId) {
        console.error('Missing required parameters for workout completion');
        return false;
      }
      
      // 1. Mark workout as completed in the database
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ 
          completed_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('id', workoutId);
        
      if (updateError) {
        console.error('Error updating workout completion:', updateError);
        return false;
      }
      
      // 2. Save exercise history entries
      await Promise.all(exercises.map(exercise => 
        ExerciseHistoryService.saveExerciseHistory(userId, exercise)
      ));
      
      // 3. Update workout streak
      await StreakService.updateStreak(userId);
      
      // 4. Check for personal records and award bonuses
      const personalRecords = await PersonalRecordService.checkForPersonalRecords(
        userId,
        {
          id: workoutId,
          exercises,
          durationSeconds: duration
        }
      );
      
      for (const record of personalRecords) {
        await PersonalRecordService.recordPersonalRecord(
          userId,
          record.exerciseId,
          record.weight,
          record.previousWeight
        );
      }
      
      // 5. Award XP for the workout
      const workout = {
        id: workoutId,
        exercises,
        durationSeconds: duration
      };
      
      const xpAwarded = await XPService.awardWorkoutXP(userId, workout, duration);
      
      // 6. Check for workout-related achievements
      await AchievementCheckerService.checkWorkoutRelatedAchievements(userId, workout);
      
      // 7. Save workout notes if any
      if (notes && Object.keys(notes).length > 0) {
        // Implement notes saving if needed
      }
      
      // 8. Show success toast
      toast.success('Treino concluído!', {
        description: 'Seu treino foi registrado com sucesso.'
      });
      
      return true;
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Erro ao concluir treino', {
        description: 'Ocorreu um erro ao registrar seu treino.'
      });
      return false;
    }
  }
}
