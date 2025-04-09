
import { supabase } from '@/integrations/supabase/client';
import { formatDistance, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Update user's workout streak
 */
export const updateStreak = async (userId: string): Promise<number> => {
  try {
    // Get user's current streak and last workout time
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak, last_workout_at')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }
    
    const currentStreak = profile.streak || 0;
    const lastWorkoutAt = profile.last_workout_at ? new Date(profile.last_workout_at) : null;
    const now = new Date();
    
    // Calculate new streak based on days since last workout
    let newStreak = currentStreak;
    
    if (!lastWorkoutAt) {
      // First workout
      newStreak = 1;
    } else {
      const daysSinceLastWorkout = differenceInDays(now, lastWorkoutAt);
      
      if (daysSinceLastWorkout <= 1) {
        // Workout done today or yesterday (continue streak)
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }
    
    // Update the streak in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        last_workout_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      throw new Error('Failed to update user streak');
    }
    
    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

/**
 * Format last workout date for display
 */
export const getFormattedLastWorkout = (lastWorkoutAt: string | null): string => {
  if (!lastWorkoutAt) {
    return 'Nenhum treino anterior';
  }
  
  try {
    const lastWorkoutDate = parseISO(lastWorkoutAt);
    return formatDistance(lastWorkoutDate, new Date(), {
      addSuffix: true,
      locale: ptBR
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data desconhecida';
  }
};
