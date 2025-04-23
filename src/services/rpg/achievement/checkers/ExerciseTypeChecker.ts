
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class ExerciseTypeChecker {
  static async checkExerciseTypeAchievements(
    userId: string, 
    unlockedIds: string[], 
    achievements: any[]
  ) {
    // Get workout varieties
    const { data: workoutVarieties } = await supabase
      .from('workout_varieties')
      .select('exercise_types')
      .eq('user_id', userId);
      
    // Get unique exercise types from all workout varieties
    const uniqueTypes = new Set<string>();
    workoutVarieties?.forEach(variety => {
      variety.exercise_types?.forEach(type => uniqueTypes.add(type));
    });
    
    // Check achievements
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;

      // Check for unique exercise types requirement
      if (requirements?.unique_exercise_types && 
          uniqueTypes.size >= requirements.unique_exercise_types) {
        console.log('Unlocking exercise variety achievement:', {
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

      // Check for specific exercise type requirements
      if (requirements?.required_types) {
        const hasAllTypes = requirements.required_types.every(
          (type: string) => uniqueTypes.has(type)
        );

        if (hasAllTypes) {
          console.log('Unlocking exercise type combination achievement:', {
            name: achievement.name,
            required: requirements.required_types,
            current: Array.from(uniqueTypes)
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
    }
  }
}
