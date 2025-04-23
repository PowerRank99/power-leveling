
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/xp/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';

export class ManualWorkoutService {
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description: string,
    activityType: string,
    workoutDate: Date
  ) {
    try {
      const validationResult = await ManualWorkoutValidationService.validateSubmission(
        userId,
        workoutDate
      );
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }
      
      const isPowerDay = validationResult.isPowerDay;
      const xpAmount = ActivityBonusService.calculateXPBonus(activityType, isPowerDay);
      
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
      await XPService.awardXP(userId, xpAmount, 'manual_workout');
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
}
