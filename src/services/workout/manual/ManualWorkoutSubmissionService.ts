
import { supabase } from '@/integrations/supabase/client';
import { FirstAchievementService } from '@/services/rpg/achievement/FirstAchievementService';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service for handling post-submission tasks for manual workouts
 */
export class ManualWorkoutSubmissionService {
  /**
   * Process post-submission tasks after a manual workout is created
   */
  static async processSubmission(
    userId: string,
    workoutId: string,
    activityType: string,
    workoutDate: Date
  ): Promise<void> {
    try {
      console.log('Processing manual workout submission:', {
        userId,
        workoutId,
        activityType,
        workoutDate
      });
      
      // Update workout variety tracking with the activity type
      await this.updateWorkoutVariety(userId, activityType, workoutDate);
      
      // Check for first manual workout achievement
      await FirstAchievementService.tryAwardFirstManualWorkoutAchievement(userId);
      
      // Verify power day status for this workout
      await this.checkAndLogPowerDay(workoutId);
      
      // Check for other relevant achievements
      await AchievementService.checkAchievements(userId);
      
    } catch (error) {
      console.error('Error in processSubmission:', error);
    }
  }
  
  /**
   * Update workout variety tracking with a new activity type
   */
  private static async updateWorkoutVariety(
    userId: string,
    activityType: string,
    workoutDate: Date
  ): Promise<void> {
    try {
      if (!activityType) return;
      
      // Format date as YYYY-MM-DD for consistent tracking
      const formattedDate = workoutDate.toISOString().split('T')[0];
      console.log(`Updating workout variety for date ${formattedDate} with type ${activityType}`);
      
      // Check if we already have an entry for this date
      const { data: existingEntry, error: checkError } = await supabase
        .from('workout_varieties')
        .select('id, exercise_types')
        .eq('user_id', userId)
        .eq('workout_date', formattedDate)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing workout variety:', checkError);
        return;
      }
      
      if (existingEntry) {
        // Update existing entry by adding the new type
        const currentTypes = existingEntry.exercise_types || [];
        if (!currentTypes.includes(activityType)) {
          const updatedTypes = [...currentTypes, activityType];
          
          console.log('Updating existing variety entry:', {
            id: existingEntry.id,
            previousTypes: currentTypes,
            updatedTypes
          });
          
          const { error: updateError } = await supabase
            .from('workout_varieties')
            .update({ exercise_types: updatedTypes })
            .eq('id', existingEntry.id);
            
          if (updateError) {
            console.error('Error updating workout variety:', updateError);
          }
        } else {
          console.log('Activity type already recorded for this date');
        }
      } else {
        // Create new entry for this date
        console.log('Creating new workout variety entry');
        
        const { data, error: insertError } = await supabase
          .from('workout_varieties')
          .insert({
            user_id: userId,
            workout_date: formattedDate,
            exercise_types: [activityType]
          })
          .select();
          
        if (insertError) {
          console.error('Error creating workout variety:', insertError);
        } else {
          console.log('Created new workout variety entry:', data);
        }
      }
    } catch (error) {
      console.error('Error updating workout variety:', error);
    }
  }
  
  /**
   * Check and log if a manual workout is marked as a power day
   */
  private static async checkAndLogPowerDay(workoutId: string): Promise<void> {
    try {
      const { data: workout, error } = await supabase
        .from('manual_workouts')
        .select('is_power_day, user_id, workout_date')
        .eq('id', workoutId)
        .single();
        
      if (error) {
        console.error('Error fetching manual workout for power day check:', error);
        return;
      }
      
      // Log power day status for debugging
      console.log('Manual workout power day status:', {
        workoutId,
        isPowerDay: workout.is_power_day,
        userId: workout.user_id,
        date: workout.workout_date
      });
    } catch (error) {
      console.error('Error checking power day status:', error);
    }
  }
}
