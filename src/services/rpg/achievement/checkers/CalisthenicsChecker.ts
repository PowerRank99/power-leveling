
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class CalisthenicsChecker {
  static async checkCalisthenicsAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      // Count using standard queries instead of RPC
      let calisthenicsCount = 0;
      
      // First, count tracked workouts with calisthenics exercises
      const { data: trackedWorkouts, error: trackedError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      
      if (trackedError) {
        console.error('Error fetching tracked workouts:', trackedError);
      } else if (trackedWorkouts?.length) {
        // Get unique workout IDs that have calisthenics exercises
        const workoutIds = trackedWorkouts.map(w => w.id);
        
        const { data: calisthenicsWorkouts, error: exerciseError } = await supabase
          .from('workout_sets')
          .select('workout_id, exercise_id')
          .in('workout_id', workoutIds)
          .not('exercise_id', 'is', null);
        
        if (exerciseError) {
          console.error('Error fetching workout sets:', exerciseError);
        } else if (calisthenicsWorkouts?.length) {
          // Get unique exercises IDs from these workouts
          const exerciseIds = [...new Set(calisthenicsWorkouts.map(s => s.exercise_id))];
          
          // Find exercises that are calisthenics type
          const { data: calisthenicsExercises, error: typeError } = await supabase
            .from('exercises')
            .select('id')
            .in('id', exerciseIds)
            .eq('type', 'Calistenia');
            
          if (typeError) {
            console.error('Error fetching calisthenics exercises:', typeError);
          } else {
            // Count unique workouts that have calisthenics exercises
            const calisthenicsExerciseIds = new Set(calisthenicsExercises?.map(e => e.id) || []);
            
            // Get unique workout IDs that contain calisthenics exercises
            const calisthenicsWorkoutIds = new Set(
              calisthenicsWorkouts
                .filter(s => calisthenicsExerciseIds.has(s.exercise_id))
                .map(s => s.workout_id)
            );
            
            calisthenicsCount += calisthenicsWorkoutIds.size;
          }
        }
      }
      
      // Add manual workouts with calisthenics activity type
      const { data: manualWorkouts, error: manualError } = await supabase
        .from('manual_workouts')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', 'Calistenia');
      
      if (manualError) {
        console.error('Error fetching calisthenics manual workouts:', manualError);
      } else {
        calisthenicsCount += manualWorkouts?.length || 0;
      }
      
      // Debug logging
      console.log('Calisthenics workouts count:', calisthenicsCount);
      
      // Check for monk/calisthenics achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        if (requirements?.calisthenics_workouts && 
            calisthenicsCount >= requirements.calisthenics_workouts) {
          console.log('Unlocking calisthenics achievement:', {
            name: achievement.name,
            required: requirements.calisthenics_workouts,
            current: calisthenicsCount
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
      console.error('Error in checkCalisthenicsAchievements:', error);
    }
  }
}
