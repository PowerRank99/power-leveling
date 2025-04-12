import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { AchievementProgressService } from './achievements/AchievementProgressService';

export class StreakService {
  /**
   * Updates a user's workout streak
   * @param userId User ID
   * @returns Whether the streak was updated successfully
   */
  static async updateStreak(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        console.error('No userId provided to updateStreak');
        return false;
      }
      
      // Get user profile data
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('last_workout_at, streak')
        .eq('id', userId)
        .single();
      
      if (fetchError || !profile) {
        console.error('Error fetching profile for streak update:', fetchError);
        return false;
      }
      
      // Calculate new streak
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let newStreak = 1; // Default to 1 for first workout or streak reset
      
      if (profile.last_workout_at) {
        const lastWorkoutDate = new Date(profile.last_workout_at);
        const lastWorkoutDay = new Date(
          lastWorkoutDate.getFullYear(), 
          lastWorkoutDate.getMonth(), 
          lastWorkoutDate.getDate()
        );
        
        // Calculate days difference
        const diffTime = today.getTime() - lastWorkoutDay.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak = (profile.streak || 0) + 1;
        } else if (diffDays === 0) {
          // Already worked out today, keep current streak
          newStreak = profile.streak || 1;
        }
        // For diffDays > 1, we reset to 1 (already the default)
      }
      
      // Update streak in profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          streak: newStreak,
          last_workout_at: now.toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating streak:', updateError);
        return false;
      }
      
      // Show streak notification if it increased
      if (profile.streak && newStreak > profile.streak) {
        toast.success(`🔥 Sequência: ${newStreak} dias`, {
          description: 'Continue assim!'
        });
        
        // Update streak achievement progress - use the optimized version now
        await AchievementProgressService.updateStreakProgress(userId, newStreak);
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateStreak:', error);
      return false;
    }
  }
}
