
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class CalisthenicsChecker {
  static async checkCalisthenicsAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      let calisthenicsCount = 0;
      
      // First, get all completed workouts
      const { data: trackedWorkouts, error: trackedError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      
      if (trackedError) {
        console.error('Error fetching tracked workouts:', trackedError);
      } else if (trackedWorkouts?.length) {
        // Get all sets with their exercises for these workouts
        const workoutIds = trackedWorkouts.map(w => w.id);
        
        // Get all workout sets and their exercises
        const { data: workoutSets, error: setsError } = await supabase
          .from('workout_sets')
          .select(`
            workout_id,
            exercise:exercises (
              id,
              type
            )
          `)
          .in('workout_id', workoutIds)
          .not('exercise_id', 'is', null);
        
        if (setsError) {
          console.error('Error fetching workout sets:', setsError);
        } else if (workoutSets?.length) {
          // Group exercises by workout and count types
          const workoutTypeCount = new Map();
          
          workoutSets.forEach(set => {
            if (!set.exercise) return;
            
            const workoutId = set.workout_id;
            const exerciseType = set.exercise.type;
            
            if (!workoutTypeCount.has(workoutId)) {
              workoutTypeCount.set(workoutId, new Map());
            }
            
            const typeCount = workoutTypeCount.get(workoutId);
            typeCount.set(exerciseType, (typeCount.get(exerciseType) || 0) + 1);
          });
          
          // Check each workout for majority/tie rule
          workoutTypeCount.forEach((typeCount, workoutId) => {
            const calisthenicCount = typeCount.get('Calistenia') || 0;
            let isCalisthenic = false;
            
            // If there are any calisthenics exercises, check if they're the majority or tied
            if (calisthenicCount > 0) {
              isCalisthenic = true; // Assume true until proven false
              
              // Check against each other type
              for (const [type, count] of typeCount.entries()) {
                if (type !== 'Calistenia' && count > calisthenicCount) {
                  isCalisthenic = false;
                  break;
                }
              }
            }
            
            if (isCalisthenic) {
              calisthenicsCount++;
            }
          });
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
