
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, WorkoutSet } from '@/types/workout';

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
        .select('id, exercise_id, weight, reps, completed, set_order, exercises(id, name)')
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
            exerciseId: exerciseId,
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
  
  /**
   * Get workout difficulty level from routine
   */
  static async getWorkoutDifficultyLevel(routineId: string | null): Promise<'iniciante' | 'intermediario' | 'avancado'> {
    if (!routineId) return 'intermediario';
    
    try {
      const { data: routineData, error } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();
        
      if (error || !routineData) {
        return 'intermediario';
      }
      
      // Map the routine level to our difficulty levels
      // Since 'level' might not exist on routines, use a type safe approach
      const level = (routineData as any).level;
      if (!level) return 'intermediario';
      
      const levelLower = level.toLowerCase();
      if (levelLower === 'beginner' || levelLower === 'iniciante') {
        return 'iniciante';
      } else if (levelLower === 'advanced' || levelLower === 'avancado') {
        return 'avancado';
      } else {
        return 'intermediario';
      }
    } catch (error) {
      console.error("Error fetching routine data:", error);
      return 'intermediario';
    }
  }
}
