
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

      // Begin transaction
      await supabase.rpc('begin_transaction');
      
      try {
        // Get current daily XP
        const { data: profileData } = await supabase
          .from('profiles')
          .select('daily_xp')
          .eq('id', userId)
          .single();
        
        const currentDailyXP = profileData?.daily_xp || 0;
        console.log('Current daily XP:', currentDailyXP);
        
        // Calculate base XP for this workout
        const baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
        const projectedTotalXP = currentDailyXP + baseXP;
        console.log('Projected total XP after this workout:', projectedTotalXP);
        
        // Count other workouts from today
        const todayStart = new Date(workoutDate);
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(workoutDate);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Get counts for both tracked and manual workouts
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
        console.log('Total existing workouts today:', totalExistingWorkouts);
        
        // Only consider Power Day if:
        // 1. We have at least one other workout AND
        // 2. Total XP will EXCEED 300 (not just reach it)
        let isPowerDay = false;
        
        if (totalExistingWorkouts >= 1 && projectedTotalXP > 300) {
          console.log('Multiple workouts and XP > 300 requirement met');
          
          // Check Power Day availability for this week
          const { available } = await PowerDayService.checkPowerDayAvailability(userId);
          console.log('Power Day available:', available);
          
          if (available) {
            // Record Power Day usage
            isPowerDay = await PowerDayService.recordPowerDayUsage(
              userId,
              ManualWorkoutValidationService.getCurrentWeek(),
              new Date().getFullYear()
            );
            
            if (isPowerDay) {
              console.log('Power Day triggered and recorded');
            }
          }
        } else {
          console.log(
            'Power Day conditions not met:',
            `Existing workouts: ${totalExistingWorkouts},`,
            `Projected XP: ${projectedTotalXP}`
          );
        }
        
        // Create manual workout with determined isPowerDay flag
        const { error: workoutError } = await supabase.rpc(
          'create_manual_workout',
          {
            p_user_id: userId,
            p_description: description,
            p_activity_type: activityType,
            p_photo_url: photoUrl,
            p_xp_awarded: baseXP,
            p_workout_date: workoutDate.toISOString(),
            p_is_power_day: isPowerDay,
            p_exercise_id: null
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
        
        // Commit transaction
        await supabase.rpc('commit_transaction');
        
        return {
          success: true,
          data: {
            xp_awarded: baseXP,
            is_power_day: isPowerDay
          }
        };
        
      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
      
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
