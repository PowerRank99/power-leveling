
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class VarietyChecker {
  static async checkVarietyAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      // Check current week's variety
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get workout varieties from the workout_varieties table
      const { data: weekVarieties, error: varietiesError } = await supabase
        .from('workout_varieties')
        .select('exercise_types')
        .eq('user_id', userId)
        .gte('workout_date', startOfWeek.toISOString().split('T')[0]);
      
      if (varietiesError) {
        console.error('Error fetching workout varieties:', varietiesError);
      }
      
      // Get manual workouts to check for activity types
      const { data: manualWorkouts, error: manualError } = await supabase
        .from('manual_workouts')
        .select('activity_type')
        .eq('user_id', userId)
        .gte('workout_date', startOfWeek.toISOString());
      
      if (manualError) {
        console.error('Error fetching manual workouts:', manualError);
      }
      
      // Combine all exercise types from both sources
      const uniqueTypes = new Set<string>();
      
      // Add types from workout_varieties
      weekVarieties?.forEach(v => {
        if (v.exercise_types) {
          v.exercise_types.forEach(t => uniqueTypes.add(t));
        }
      });
      
      // Add types from manual workouts
      manualWorkouts?.forEach(w => {
        if (w.activity_type) {
          uniqueTypes.add(w.activity_type);
        }
      });
      
      // Debug logging
      console.log('Unique exercise types this week:', {
        types: Array.from(uniqueTypes),
        count: uniqueTypes.size
      });
      
      // Check for combo fitness achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        if (requirements?.unique_exercise_types && 
            uniqueTypes.size >= requirements.unique_exercise_types) {
          console.log('Unlocking variety achievement:', {
            name: achievement.name,
            required: requirements.unique_exercise_types,
            current: uniqueTypes.size,
            types: Array.from(uniqueTypes)
          });
          
          await AchievementAwardService.awardAchievement(
            userId,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.xp_reward,
            achievement.points
          );
        }
      }
    } catch (error) {
      console.error('Error in checkVarietyAchievements:', error);
    }
  }
}
