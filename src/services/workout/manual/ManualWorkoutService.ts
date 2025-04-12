
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { toast } from 'sonner';
import { AchievementCheckerService } from '@/services/rpg/achievements/AchievementCheckerService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';

/**
 * Service for handling manual workout submissions
 */
export class ManualWorkoutService {
  /**
   * Submit a manual workout with photo evidence
   */
  static async submitManualWorkout(
    userId: string,
    data: {
      description?: string;
      activityType: string;
      photoUrl: string;
      workoutDate: Date;
      isPowerDay?: boolean;
      exerciseId?: string;
    }
  ): Promise<boolean> {
    try {
      // Validate the submission
      const validationResult = await ManualWorkoutValidationService.validateManualWorkout(
        userId,
        data.workoutDate
      );
      
      if (!validationResult.isValid) {
        toast.error('Erro ao registrar treino', {
          description: validationResult.errorMessage
        });
        return false;
      }
      
      // Determine XP amount (default is 100 XP)
      let xpAmount = XPService.MANUAL_WORKOUT_BASE_XP;
      
      // Apply activity-specific bonuses if applicable
      if (data.activityType) {
        xpAmount = ActivityBonusService.getActivityXP(data.activityType);
      }
      
      // Check if this is a power day submission
      const isPowerDay = !!data.isPowerDay;
      
      // Record the manual workout
      const { error } = await supabase
        .from('manual_workouts')
        .insert({
          user_id: userId,
          description: data.description || null,
          activity_type: data.activityType,
          photo_url: data.photoUrl,
          xp_awarded: xpAmount,
          workout_date: data.workoutDate.toISOString(),
          is_power_day: isPowerDay,
          exercise_id: data.exerciseId || null
        });
        
      if (error) {
        console.error('Error recording manual workout:', error);
        toast.error('Erro ao registrar treino', {
          description: 'Não foi possível salvar o registro do treino.'
        });
        return false;
      }
      
      // Update streak
      await StreakService.updateStreak(userId);
      
      // Award XP
      await XPService.awardXP(userId, xpAmount, 'manual_workout');
      
      // Record power day usage if applicable
      if (isPowerDay) {
        const now = new Date();
        const week = this.getWeekNumber(now);
        const year = now.getFullYear();
        await XPService.recordPowerDayUsage(userId, week, year);
      }
      
      // Check for manual workout achievements
      await AchievementCheckerService.checkManualWorkoutAchievements(userId);
      
      // Show success toast
      toast.success('Treino registrado!', {
        description: `Você ganhou ${xpAmount} XP pelo seu treino.`
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting manual workout:', error);
      toast.error('Erro ao registrar treino', {
        description: 'Ocorreu um erro inesperado.'
      });
      return false;
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
}
