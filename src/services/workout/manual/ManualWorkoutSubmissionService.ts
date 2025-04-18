
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
      // Update workout variety tracking with the activity type
      await this.updateWorkoutVariety(userId, activityType, workoutDate);
      
      // Check for first manual workout achievement
      await FirstAchievementService.tryAwardFirstManualWorkoutAchievement(userId);
      
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
          
          await supabase
            .from('workout_varieties')
            .update({ exercise_types: updatedTypes })
            .eq('id', existingEntry.id);
        }
      } else {
        // Create new entry for this date
        await supabase
          .from('workout_varieties')
          .insert({
            user_id: userId,
            workout_date: formattedDate,
            exercise_types: [activityType]
          });
      }
    } catch (error) {
      console.error('Error updating workout variety:', error);
    }
  }
}
