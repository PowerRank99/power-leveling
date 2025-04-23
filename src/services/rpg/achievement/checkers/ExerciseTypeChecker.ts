
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class ExerciseTypeChecker {
  static async checkExerciseTypeAchievements(
    userId: string, 
    unlockedIds: string[], 
    achievements: any[]
  ) {
    // Define mapping for exercise type variations
    const exerciseTypeMap = {
      'Calistenia': ['Calistenia', 'Calisthenics'],
      'Cardio': ['Cardio'],
      'Musculação': ['Musculação', 'Weight Training', 'Strength Training'],
      'Mobilidade & Flexibilidade': ['Mobilidade & Flexibilidade', 'Mobility', 'Flexibility'],
      'Esportes': ['Esportes', 'Sports']
    };

    // Get workouts and manual workouts with exercise types
    const { data: trackedWorkouts } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId);

    const { data: manualWorkouts } = await supabase
      .from('manual_workouts')
      .select('activity_type')
      .eq('user_id', userId);

    // Combine workout types
    const allWorkoutTypes = [
      ...trackedWorkouts.map(() => 'Calistenia'), // Assuming tracked workouts are Calistenia
      ...manualWorkouts.map(w => w.activity_type)
    ];

    // Check achievements
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;

      // Check for exercise type count achievements
      if (requirements?.calistenia_count) {
        const calisteniaCounts = allWorkoutTypes.filter(type => 
          exerciseTypeMap['Calistenia'].includes(type)
        ).length;

        if (calisteniaCounts >= requirements.calistenia_count) {
          console.log('Unlocking exercise type achievement:', {
            name: achievement.name,
            required: requirements.calistenia_count,
            current: calisteniaCounts
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
