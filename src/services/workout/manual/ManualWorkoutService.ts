
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/xp/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';
import { ManualWorkout } from '@/types/manualWorkoutTypes';

export class ManualWorkoutService {
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description: string,
    activityType: string,
    workoutDate: Date
  ) {
    try {
      const validationResult = await ManualWorkoutValidationService.validateWorkoutSubmission(
        userId,
        photoUrl,
        workoutDate
      );
      
      if (!validationResult) {
        return {
          success: false,
          error: 'Validation failed'
        };
      }
      
      const isPowerDay = await ManualWorkoutValidationService.checkPowerDay(userId);
      const xpAmount = isPowerDay ? 
        XPService.MANUAL_WORKOUT_BASE_XP + XPService.POWER_DAY_BONUS_XP : 
        XPService.MANUAL_WORKOUT_BASE_XP;
      
      // Create manual workout
      const { error: workoutError } = await supabase.rpc(
        'create_manual_workout',
        {
          p_user_id: userId,
          p_description: description,
          p_activity_type: activityType,
          p_exercise_id: null,
          p_photo_url: photoUrl,
          p_xp_awarded: xpAmount,
          p_workout_date: workoutDate.toISOString(),
          p_is_power_day: isPowerDay
        }
      );
      
      if (workoutError) {
        throw new Error(`Error creating manual workout: ${workoutError.message}`);
      }
      
      // Update workout variety tracking
      await supabase.rpc(
        'manage_workout_variety',
        {
          p_user_id: userId,
          p_workout_date: workoutDate.toISOString().split('T')[0],
          p_activity_type: activityType
        }
      );
      
      // Award XP and trigger achievement check
      await XPService.addXP(userId, xpAmount, 'manual_workout');
      await AchievementService.checkAchievements(userId);
      
      return {
        success: true,
        data: {
          xp_awarded: xpAmount,
          is_power_day: isPowerDay
        }
      };
      
    } catch (error: any) {
      console.error('Error in submitManualWorkout:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's manual workouts
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_manual_workouts', {
        p_user_id: userId
      });
      
      if (error) {
        throw new Error(`Error fetching manual workouts: ${error.message}`);
      }
      
      return data.map((workout: any) => ({
        id: workout.id,
        description: workout.description,
        activityType: workout.activity_type,
        exerciseId: workout.exercise_id,
        photoUrl: workout.photo_url,
        xpAwarded: workout.xp_awarded,
        createdAt: workout.created_at,
        workoutDate: workout.workout_date,
        isPowerDay: workout.is_power_day
      }));
    } catch (error) {
      console.error('Error getting manual workouts:', error);
      return [];
    }
  }

  /**
   * Delete a manual workout
   */
  static async deleteManualWorkout(userId: string, workoutId: string) {
    try {
      const { error } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Error deleting manual workout: ${error.message}`);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting manual workout:', error);
      return { 
        success: false,
        error: error.message
      };
    }
  }
}
