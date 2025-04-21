
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';
import { ExerciseType } from '@/components/workout/types/Exercise';
import { AchievementDebug } from '@/services/rpg/AchievementDebug';

export class ExerciseTypeChecker {
  static async checkExerciseTypeAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[],
    exerciseType: ExerciseType
  ) {
    try {
      let typeCount = 0;
      
      // First, get all completed workouts
      const { data: trackedWorkouts, error: trackedError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      
      if (trackedError) {
        console.error(`Error fetching tracked workouts:`, trackedError);
      } else if (trackedWorkouts?.length) {
        // Debug log workouts found
        console.log(`Found ${trackedWorkouts.length} completed workouts for type ${exerciseType}`);
        
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
            const currentType = set.exercise.type;
            
            if (!workoutTypeCount.has(workoutId)) {
              workoutTypeCount.set(workoutId, new Map());
            }
            
            const typeCount = workoutTypeCount.get(workoutId);
            typeCount.set(currentType, (typeCount.get(currentType) || 0) + 1);
          });
          
          // Debug log exercise type counts per workout
          workoutTypeCount.forEach((typeCounts, workoutId) => {
            console.log(`Workout ${workoutId} exercise type counts:`, Object.fromEntries(typeCounts));
          });
          
          // Check each workout for majority/tie rule
          workoutTypeCount.forEach((typeCounts, workoutId) => {
            const targetTypeCount = typeCounts.get(exerciseType) || 0;
            let isTargetType = false;
            
            if (targetTypeCount > 0) {
              isTargetType = true;
              
              // Check against each other type
              for (const [type, count] of typeCounts.entries()) {
                if (type !== exerciseType && count > targetTypeCount) {
                  isTargetType = false;
                  break;
                }
              }
            }
            
            if (isTargetType) {
              typeCount++;
              console.log(`Workout ${workoutId} counted as ${exerciseType} workout`);
            }
          });
          
          console.log(`Total tracked ${exerciseType} workouts: ${typeCount}`);
        }
      }
      
      // Add manual workouts with matching activity type
      const { data: manualWorkouts, error: manualError } = await supabase
        .from('manual_workouts')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', exerciseType);
      
      if (manualError) {
        console.error(`Error fetching ${exerciseType} manual workouts:`, manualError);
      } else {
        const manualCount = manualWorkouts?.length || 0;
        typeCount += manualCount;
        console.log(`Found ${manualCount} manual ${exerciseType} workouts`);
      }
      
      // Debug logging
      console.log(`Final ${exerciseType} workouts count:`, typeCount);
      
      // Check for achievements specific to this exercise type
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        // Convert type to snake case for requirements check
        const reqKey = `${exerciseType.toLowerCase().replace(/ & /g, '_')}_workouts`;
        
        // Debug log achievement check
        console.log(`Checking achievement: ${achievement.name}`, {
          requirements,
          reqKey,
          currentCount: typeCount
        });
        
        if (requirements?.[reqKey] && typeCount >= requirements[reqKey]) {
          console.log(`Unlocking ${exerciseType} achievement:`, {
            name: achievement.name,
            required: requirements[reqKey],
            current: typeCount
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
      console.error(`Error in check${exerciseType}Achievements:`, error);
    }
  }
}
