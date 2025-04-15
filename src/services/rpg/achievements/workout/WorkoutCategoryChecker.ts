
import { supabase } from '@/integrations/supabase/client';

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
      
      // Fetch category-specific achievements
      const { data: categoryAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id, category_type, requirements')
        .eq('category', 'workout_category');
        
      if (achievementsError) throw achievementsError;
      
      // Check for category-specific achievements
      categoryAchievements?.forEach(achievement => {
        const categoryType = achievement.category_type;
        const requiredCount = achievement.requirements?.count || 0;
        
        if (categoryType && categoryCounts[categoryType] && categoryCounts[categoryType] >= requiredCount) {
          achievementsToCheck.push(achievement.id);
        }
      });
    } catch (error) {
      console.error('Error checking workout category achievements:', error);
    }
  }
}
