import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { toast } from 'sonner';
import { AchievementCheckerService } from '@/services/rpg/achievements/AchievementCheckerService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';
import { ManualWorkout } from '@/types/manualWorkoutTypes';

/**
 * Service for handling manual workout submissions
 */
export class ManualWorkoutService {
  /**
   * Submit a manual workout with photo
   */
  static async submitManualWorkout(
    userId: string,
    data: {
      description: string;
      activityType: string;
      exerciseId?: string;
      photoUrl: string;
      workoutDate: Date;
    }
  ): Promise<ServiceResponse<{ id: string; xpAwarded: number }>> {
    try {
      // Use the validation service
      const validationResult = await ManualWorkoutValidationService.validateManualWorkout(
        userId,
        data.workoutDate
      );
      
      if (!validationResult.isValid) {
        toast.error('Erro ao registrar treino', {
          description: validationResult.errorMessage
        });
        return { success: false, error: validationResult.errorMessage };
      }
      
      // Determine XP amount (default is 100 XP)
      let xpAmount = 100;
      
      // Apply activity-specific bonuses if applicable
      if (data.activityType) {
        xpAmount = ActivityBonusService.getActivityXP(data.activityType);
      }
      
      // Check for Power Day activation
      let isPowerDay = false;
      const now = new Date();
      const week = this.getWeekNumber(now);
      const year = now.getFullYear();
      
      const powerDayCheck = await XPService.checkPowerDayAvailability(userId);
      if (powerDayCheck.available) {
        // Record Power Day usage if available
        isPowerDay = await XPService.recordPowerDayUsage(userId, week, year);
      }
      
      // Record the manual workout
      const { error, data: result } = await supabase
        .from('manual_workouts')
        .insert({
          user_id: userId,
          description: data.description || null,
          activity_type: data.activityType || 'general',
          photo_url: data.photoUrl,
          exercise_id: data.exerciseId || null,
          xp_awarded: xpAmount,
          workout_date: data.workoutDate.toISOString(),
          is_power_day: isPowerDay
        });
        
      if (error) {
        console.error('Error recording manual workout:', error);
        toast.error('Erro ao registrar treino', {
          description: 'Não foi possível salvar o registro do treino.'
        });
        return { success: false, error: 'Erro ao salvar o treino' };
      }
      
      // Update streak
      await StreakService.updateStreak(userId);
      
      // Award XP
      const finalXpAmount = xpAmount;
      await XPService.awardXP(userId, finalXpAmount, 'manual_workout');
      
      // Check for manual workout achievements
      await AchievementCheckerService.checkManualWorkoutAchievements(userId);
      
      // Show success toast
      toast.success('Treino registrado!', {
        description: `Você ganhou ${finalXpAmount} XP pelo seu treino.`
      });
      
      return { 
        success: true,
        data: { 
          id: result.data.id,
          xpAwarded: finalXpAmount 
        }
      };
    } catch (error) {
      console.error('Error submitting manual workout:', error);
      toast.error('Erro ao registrar treino', {
        description: 'Ocorreu um erro inesperado.'
      });
      return { success: false, error: 'Erro ao processar o treino' };
    }
  }
  
  /**
   * Helper function to get the ISO week number
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get user's manual workouts
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      if (!userId) {
        console.warn('No user ID provided to getUserManualWorkouts');
        return [];
      }
      
      // Query using Supabase RPC function
      const { data, error } = await supabase
        .from('manual_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching manual workouts:', error);
        return [];
      }
      
      // Transform database records to ManualWorkout objects
      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        description: record.description,
        activityType: record.activity_type,
        exerciseId: record.exercise_id,
        photoUrl: record.photo_url,
        xpAwarded: record.xp_awarded,
        createdAt: record.created_at,
        workoutDate: record.workout_date,
        isPowerDay: record.is_power_day
      }));
    } catch (error) {
      console.error('Error in getUserManualWorkouts:', error);
      return [];
    }
  }

  /**
   * Delete a manual workout
   */
  static async deleteManualWorkout(userId: string, workoutId: string): Promise<{ success: boolean, error?: string }> {
    try {
      if (!userId || !workoutId) {
        return { success: false, error: 'Parâmetros inválidos' };
      }
      
      // Delete the manual workout record
      const { error } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error deleting manual workout:', error);
        return { success: false, error: 'Erro ao excluir o treino manual' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteManualWorkout:', error);
      return { success: false, error: 'Erro ao processar a exclusão' };
    }
  }
}
