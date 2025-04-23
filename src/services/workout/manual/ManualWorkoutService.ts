import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/xp/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { PowerDayService } from '@/services/rpg/bonus/PowerDayService';

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
      
      // First check the user's daily XP to detect if this will trigger a Power Day
      const { data: profileData } = await supabase
        .from('profiles')
        .select('daily_xp')
        .eq('id', userId)
        .single();
      
      // Calculate base XP for manual workout
      const baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
      
      // IMPORTANT FIX: Power Day is only triggered if:
      // 1. Daily XP will exceed 300 after this workout (not just reach it)
      // 2. There's at least one other workout today already
      // 3. The user has Power Days available this week
      let isPowerDay = false;

      // Check daily XP threshold first - must EXCEED 300 XP (not just reach it)
      // This means after adding this workout's XP, total must be > 300
      if ((profileData?.daily_xp || 0) + baseXP > 300) {
        console.log('Daily XP threshold met for potential Power Day trigger');
        
        // Now check if there's at least one other workout today
        const todayStart = new Date(workoutDate);
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(workoutDate);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Count other workouts from today
        const [{ count: trackedCount }, { count: manualCount }] = await Promise.all([
          supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('started_at', todayStart.toISOString())
            .lt('completed_at', todayEnd.toISOString()),
          
          supabase
            .from('manual_workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('workout_date', todayStart.toISOString())
            .lt('workout_date', todayEnd.toISOString())
        ]);
        
        const totalExistingWorkouts = (trackedCount || 0) + (manualCount || 0);
        console.log(`Found ${totalExistingWorkouts} existing workouts today`);
        
        // Only check Power Day availability if we have at least 1 existing workout
        // (We need 2+ total, with this new one counting as one)
        if (totalExistingWorkouts >= 1) {
          console.log('Multiple workouts requirement met for Power Day');
          
          // Now check if Power Days are still available this week
          const { available } = await PowerDayService.checkPowerDayAvailability(userId);
          
          if (available) {
            // All conditions met - record Power Day usage and update flag
            isPowerDay = await PowerDayService.recordPowerDayUsage(
              userId, 
              ManualWorkoutValidationService.getCurrentWeek(), 
              new Date().getFullYear()
            );
            
            if (isPowerDay) {
              console.log('Power Day triggered and recorded for user', userId);
            }
          } else {
            console.log('No Power Days available this week');
          }
        } else {
          console.log('Not enough workouts today for Power Day trigger');
        }
      } else {
        console.log('Daily XP threshold not met for Power Day trigger');
      }
      
      // Create manual workout - with isPowerDay flag
      const { error: workoutError } = await supabase.rpc(
        'create_manual_workout',
        {
          p_user_id: userId,
          p_description: description,
          p_activity_type: activityType,
          p_exercise_id: null,
          p_photo_url: photoUrl,
          p_xp_awarded: baseXP,
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
      await XPService.addXP(userId, baseXP, 'manual_workout');
      await AchievementService.checkAchievements(userId);
      
      return {
        success: true,
        data: {
          xp_awarded: baseXP,
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
