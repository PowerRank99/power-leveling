import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { AchievementProgressService } from './achievements/AchievementProgressService';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';

export class StreakService {
  /**
   * Updates a user's workout streak
   * @param userId User ID
   * @returns Whether the streak was updated successfully
   */
  static async updateStreak(userId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) {
          throw new Error('No userId provided to updateStreak');
        }
        
        // Get user profile data
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('last_workout_at, streak')
          .eq('id', userId)
          .single();
        
        if (fetchError || !profile) {
          throw new Error('Error fetching profile for streak update: ' + fetchError?.message);
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
          throw new Error('Error updating streak: ' + updateError.message);
        }
        
        // Show streak notification if it increased
        if (profile.streak && newStreak > profile.streak) {
          toast.success(`🔥 Sequência: ${newStreak} dias`, {
            description: 'Continue assim!'
          });
          
          // Update streak achievement progress
          await AchievementProgressService.updateStreakProgress(userId, newStreak);
        }
        
        return true;
      },
      'UPDATE_STREAK',
      {
        userMessage: 'Erro ao atualizar sequência de treinos',
        showToast: false
      }
    );
  }
}
