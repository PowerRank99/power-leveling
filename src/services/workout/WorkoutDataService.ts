
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Service for fetching and formatting workout data
 */
export class WorkoutDataService {
  /**
   * Fetch workout exercises for XP calculation
   */
  static async fetchWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    try {
      const { data: exerciseSets, error: setsError } = await supabase
        .from('workout_sets')
        .select('id, exercise_id, weight, reps, completed, set_order, exercises(id, name, type)')
        .eq('workout_id', workoutId)
        .order('set_order', { ascending: true });
      
      if (setsError) throw setsError;
      
      // Group sets by exercise
      const exerciseMap: Record<string, WorkoutExercise> = {};
      exerciseSets.forEach(set => {
        const exerciseId = set.exercise_id;
        if (!exerciseId) return;
        
        if (!exerciseMap[exerciseId]) {
          exerciseMap[exerciseId] = {
            id: exerciseId,
            name: set.exercises?.name || 'Unknown Exercise',
            type: set.exercises?.type || 'Musculação',
            sets: []
          };
        }
        
        exerciseMap[exerciseId].sets.push({
          id: set.id,
          weight: set.weight?.toString() || '0',
          reps: set.reps?.toString() || '0',
          completed: set.completed || false,
          set_order: set.set_order
        });
      });
      
      return Object.values(exerciseMap);
    } catch (error) {
      console.error("Error fetching workout exercises:", error);
      return [];
    }
  }
  
  /**
   * Fetch user profile data
   */
  static async fetchUserProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('class, streak')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      return profile;
    } catch (profileError) {
      console.error("Error fetching user profile:", profileError);
      return null;
    }
  }
}
