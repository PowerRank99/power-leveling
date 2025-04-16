import { supabase } from '@/integrations/supabase/client';
import { ErrorHandlingService, ServiceResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

export class StreakService {
  static async updateStreak(userId: string, date: Date = new Date()): Promise<ServiceResponse<number>> {
    try {
      const formattedDate = date.toISOString().split('T')[0];

      // Fetch the user's profile to get the current streak and last workout date
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak, last_workout_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return {
          success: false,
          error: {
            message: profileError.message || 'Error fetching profile',
            category: ErrorCategory.DATABASE,
            originalError: profileError
          }
        };
      }

      const lastWorkoutDate = profile?.last_workout_at ? new Date(profile.last_workout_at).toISOString().split('T')[0] : null;
      const todayDate = formattedDate;

      let newStreak = profile?.streak || 0;

      if (lastWorkoutDate !== todayDate) {
        const yesterday = new Date(date);
        yesterday.setDate(date.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        if (lastWorkoutDate === yesterdayDate) {
          newStreak = (profile?.streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      } else {
        return { success: true, data: newStreak };
      }

      // Update the user's streak in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ streak: newStreak, last_workout_at: date.toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating streak:', updateError);
        return {
          success: false,
          error: {
            message: updateError.message || 'Error updating streak',
            category: ErrorCategory.DATABASE,
            originalError: updateError
          }
        };
      }

      return { success: true, data: newStreak };
    } catch (error: any) {
      console.error('Error updating streak:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Error updating streak',
          category: ErrorCategory.UNKNOWN_ERROR,
          originalError: error
        }
      };
    }
  }
}
