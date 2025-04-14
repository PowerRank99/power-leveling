
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for checking workout category-specific achievements
 */
export class WorkoutCategoryChecker {
  static async checkWorkoutCategoryAchievements(
    userId: string, 
    achievementsToCheck: string[]
  ): Promise<void> {
    try {
      // Get counts of different workout categories
      const { data, error } = await supabase
        .from('workouts')
        .select('category')
        .eq('user_id', userId);
      
      if (error) throw new Error(error.message);
      
      // Count workouts by category
      const categoryCounts: Record<string, number> = {};
      data?.forEach(workout => {
        const category = workout.category || 'unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Check for category-specific achievements
      if (categoryCounts['strength'] >= 10) {
        achievementsToCheck.push('forca-de-guerreiro');
      }
      
      if (categoryCounts['cardio'] >= 10) {
        achievementsToCheck.push('cardio-sem-folego');
      }
      
      if (categoryCounts['mobility'] >= 10) {
        achievementsToCheck.push('guru-do-alongamento');
      }
      
      if (categoryCounts['calisthenics'] >= 10) {
        achievementsToCheck.push('forca-interior');
      }
      
      if (categoryCounts['sport'] >= 10) {
        achievementsToCheck.push('craque-dos-esportes');
      }
      
      // Check for first sport workout
      if (categoryCounts['sport'] >= 1) {
        achievementsToCheck.push('esporte-de-primeira');
      }
    } catch (error) {
      console.error('Error checking workout category achievements:', error);
    }
  }
}
