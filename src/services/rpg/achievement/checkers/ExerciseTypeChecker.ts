
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';
import { ExerciseType } from '@/components/workout/types/Exercise';

export class ExerciseTypeChecker {
  static async checkExerciseTypeAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[],
    exerciseType: ExerciseType
  ) {
    try {
      console.log(`[ExerciseTypeChecker] Checking ${exerciseType} achievements for user:`, userId);

      let typeCount = 0;

      // Get all completed tracked workouts
      const { data: trackedWorkouts, error: trackedError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (trackedError) {
        console.error(`[ExerciseTypeChecker] Error fetching tracked workouts:`, trackedError);
      } else if (trackedWorkouts?.length) {
        console.log(`[ExerciseTypeChecker] Found ${trackedWorkouts.length} completed workouts for type ${exerciseType}`);

        // Get all workout sets for these workouts, with their exercise details
        const workoutIds = trackedWorkouts.map(w => w.id);

        // Only perform .in() query if there's something to query
        let workoutSets = [];
        if (workoutIds.length > 0) {
          // Debug: Calistenia check for current user
          if (userId === "32dcd73d-7f7e-4b86-ba88-857d935e7242") { // hardcoded Pierri Bruno's user id for more debug info
            console.log("[DEBUG] Pierri Bruno is target for Calistenia check (Monge em ação)");
          }
          const { data: _workoutSets, error: setsError } = await supabase
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
            console.error('[ExerciseTypeChecker] Error fetching workout sets:', setsError);
          } else {
            workoutSets = _workoutSets || [];
            console.log(`[ExerciseTypeChecker] Fetched workout sets for completed workouts:`, workoutSets.length);
            // Show a few example exercise types and ids for DEBUG
            workoutSets.slice(0, 4).forEach(set =>
              console.log('[DEBUG][FirstSets]', set.exercise?.type, set.exercise?.id)
            );
          }
        }

        // Group exercises by workout and count types
        const workoutTypeCount = new Map();

        workoutSets.forEach(set => {
          if (!set.exercise) return;

          const workoutId = set.workout_id;
          const currentType = set.exercise.type;

          if (!workoutTypeCount.has(workoutId)) {
            workoutTypeCount.set(workoutId, new Map());
          }

          const mapForWorkout = workoutTypeCount.get(workoutId);
          mapForWorkout.set(currentType, (mapForWorkout.get(currentType) || 0) + 1);
        });

        // See if each workout qualifies as "majority or tie" for this exercise type
        workoutTypeCount.forEach((typeCounts, workoutId) => {
          const targetTypeCount = typeCounts.get(exerciseType) || 0;
          let isTargetType = false;

          if (targetTypeCount > 0) {
            isTargetType = true;
            for (const [type, count] of typeCounts.entries()) {
              // If another type present more than target, not the majority
              if (type !== exerciseType && count > targetTypeCount) {
                isTargetType = false;
                break;
              }
            }
          }

          if (isTargetType) {
            typeCount++;
            console.log(`[ExerciseTypeChecker] Workout ${workoutId} counted as ${exerciseType} workout`);
          }
        });

        console.log(`[ExerciseTypeChecker] Total tracked ${exerciseType} workouts: ${typeCount}`);
      } else {
        console.log(`[ExerciseTypeChecker] No completed tracked workouts for type ${exerciseType}`);
      }

      // Count manual workouts matching activity_type
      const { data: manualWorkouts, error: manualError } = await supabase
        .from('manual_workouts')
        .select('id, workout_date, activity_type')
        .eq('user_id', userId)
        .eq('activity_type', exerciseType);

      if (manualError) {
        console.error(`[ExerciseTypeChecker] Error fetching ${exerciseType} manual workouts:`, manualError);
      } else {
        const manualCount = manualWorkouts?.length || 0;
        typeCount += manualCount;
        console.log(`[ExerciseTypeChecker] Found ${manualCount} manual ${exerciseType} workouts:`, manualWorkouts);
      }

      // Show the summed up awarded type count
      console.log(`[ExerciseTypeChecker] Final ${exerciseType} workouts count:`, typeCount);

      // --- MAIN PATCH: LOG *ALL* achievement names + requirements for "Calistenia" counting ---
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) {
          console.log(`[ExerciseTypeChecker] Achievement ${achievement.name} already unlocked, skipping`);
          continue;
        }

        // Defensive parse/copy for requirements object
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;

        // Extra DEBUG for "Monge em ação"
        if (
            achievement.name?.toLowerCase().includes("monge") ||
            achievement.description?.toLowerCase().includes("calistenia") ||
            exerciseType === "Calistenia"
        ) {
          console.log(`[DEBUG][Monge em ação][${achievement.name}] Requirements:`, requirements, "Type:", exerciseType, "Current:", typeCount);
        }

        // All possible keys for this requirement, be robust to naming/underscores
        const typeFormatted = exerciseType.toLowerCase();
        const possibleReqKeys = [
          `${typeFormatted.replace(/ & /g, '_')}_workouts`,
          `${typeFormatted.replace(/ /g, '_')}_workouts`,
          `${typeFormatted}_workouts`,
          `${typeFormatted}_count`,
          `${typeFormatted}`,
          `${typeFormatted.replace(/ /g, '')}_workouts`,
          `${typeFormatted.replace(/ /g, '')}`,
        ];
        console.log(`[ExerciseTypeChecker] Requirement keys to check for ${achievement.name}:`, possibleReqKeys);

        // Show all keys actually present
        if (requirements && typeof requirements === 'object') {
          console.log(`[ExerciseTypeChecker] All keys present in requirements:`, Object.keys(requirements));
        }

        // Check for which requirement key is present
        let requirementValue = null;
        let matchedKey = null;

        for (const key of possibleReqKeys) {
          if (requirements && requirements[key] !== undefined) {
            requirementValue = requirements[key];
            matchedKey = key;
            break;
          }
        }

        // Log result of key matching
        if (matchedKey && requirementValue !== null) {
          console.log(`[ExerciseTypeChecker] Requirement key matched: ${matchedKey}, required: ${requirementValue}, current: ${typeCount}`);
        } else {
          console.warn(`[ExerciseTypeChecker] No requirement key matched for achievement: ${achievement.name}. Requirements object:`, requirements);
        }

        // Unlock if requirement is met
        if (matchedKey && requirementValue !== null && typeCount >= requirementValue) {
          console.log(`[ExerciseTypeChecker] Unlocking achievement "${achievement.name}" for user ${userId}. Required: ${requirementValue}, current: ${typeCount}`);
          const result = await AchievementAwardService.awardAchievement(
            userId,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.xp_reward,
            achievement.points
          );
          if (!result) {
            console.error(`[ExerciseTypeChecker] Award service did not return true for ${achievement.name}!`);
          } else {
            console.log(`[ExerciseTypeChecker] Achievement awarded: ${achievement.name}`);
          }
        }
      }
    } catch (error) {
      console.error(`[ExerciseTypeChecker] Error in check${exerciseType}Achievements:`, error);
    }
  }
}
