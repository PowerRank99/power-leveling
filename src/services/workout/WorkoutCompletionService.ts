
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkoutExercise } from '@/types/workoutTypes';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { AchievementService } from '@/services/rpg/AchievementService';

export class WorkoutCompletionService {
  /**
   * Completes a workout and awards XP and achievements
   * @param workoutId The ID of the workout to complete
   * @param elapsedTime The elapsed time in seconds
   */
  static async finishWorkout(workoutId: string, elapsedTime: number): Promise<boolean> {
    try {
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Get workout data to check user_id and routine_id
      const { data: workoutData, error: fetchError } = await supabase
        .from('workouts')
        .select('user_id, routine_id, completed_at')
        .eq('id', workoutId)
        .single();
        
      if (fetchError || !workoutData) {
        console.error("Error fetching workout data:", fetchError);
        throw new Error("Não foi possível localizar os dados do treino");
      }
      
      // Check if workout is already completed
      if (workoutData.completed_at) {
        console.log("Workout already completed, skipping update");
        return true;
      }
      
      const userId = workoutData.user_id;
      if (!userId) {
        console.error("No user ID associated with workout");
        throw new Error("Treino sem usuário associado");
      }
      
      // Update workout with completion status
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      // Process RPG rewards
      await this.processRPGRewards(workoutId, userId, workoutData.routine_id, elapsedTime);
      
      // Toast notification
      toast.success("Treino finalizado", {
        description: "Seu treino foi salvo com sucesso!"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    }
  }
  
  /**
   * Process RPG rewards for completing a workout
   */
  private static async processRPGRewards(
    workoutId: string, 
    userId: string, 
    routineId: string | null,
    elapsedTime: number
  ): Promise<void> {
    try {
      // Get workout exercises and details for XP calculation
      const exercises = await this.fetchWorkoutExercises(workoutId);
      
      // Get user profile data to determine class and streak
      const userProfile = await this.fetchUserProfile(userId);
      
      // Step 1: Update user streak
      await StreakService.updateStreak(userId);
      
      // Step 2: Get workout difficulty level (defaulting to intermediate)
      let difficultyLevel: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario';
      
      if (routineId) {
        try {
          const { data: routineData, error } = await supabase
            .from('routines')
            .select('name')
            .eq('id', routineId)
            .single();
            
          if (!error && routineData) {
            // For now we'll use a default difficulty since the level column doesn't exist
            // This will be updated if a level column is added to routines table
            difficultyLevel = 'intermediario';
          }
        } catch (routineError) {
          console.error("Error fetching routine data:", routineError);
        }
      }
      
      // Step 3: Check for personal records
      const personalRecords = await XPService.checkForPersonalRecords(userId, {
        id: workoutId,
        exercises,
        durationSeconds: elapsedTime,
        difficulty: difficultyLevel
      });
      
      // Log personal records if any
      if (personalRecords.length > 0) {
        console.log("Personal records achieved:", personalRecords);
        toast.success("Novo recorde pessoal!", {
          description: "Você superou seu peso anterior em um exercício!"
        });
      }
      
      // Step 4: Calculate and award XP
      const baseXP = XPService.calculateWorkoutXP(
        { id: workoutId, exercises, durationSeconds: elapsedTime, difficulty: difficultyLevel },
        userProfile?.class,
        userProfile?.streak || 0,
        difficultyLevel
      );
      
      await XPService.awardXP(userId, baseXP, personalRecords);
      
      // Step 5: Check for achievements
      await AchievementService.checkAchievements(userId);
      
    } catch (rpgError) {
      // Log but don't fail the workout completion
      console.error("Error processing RPG rewards:", rpgError);
    }
  }
  
  /**
   * Fetch workout exercises for XP calculation
   */
  private static async fetchWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
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
  private static async fetchUserProfile(userId: string) {
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
   * Discards a workout
   */
  static async discardWorkout(workoutId: string): Promise<boolean> {
    try {
      console.log("Discarding workout:", workoutId);
      
      // Delete workout
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      toast.info("Treino descartado");
      return true;
    } catch (error: any) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error.message || "Ocorreu um erro ao descartar seu treino"
      });
      return false;
    }
  }
}
