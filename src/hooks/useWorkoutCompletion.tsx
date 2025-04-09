
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XPService } from '@/services/rpg/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { StreakService } from '@/services/rpg/StreakService';
import { WorkoutExercise } from '@/types/workoutTypes';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Modified timeout function that properly handles Supabase queries
const withTimeout = async <T,>(promiseFactory: () => Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  
  try {
    const resultPromise = promiseFactory();
    const result = await Promise.race([resultPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const useWorkoutCompletion = (workoutId: string | null) => {
  const finishWorkout = async (elapsedTime: number) => {
    if (!workoutId) {
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Check if the workout is already completed
      let workoutData;
      try {
        workoutData = await withTimeout(
          async () => {
            const { data, error } = await supabase
              .from('workouts')
              .select('completed_at, user_id, routine_id')
              .eq('id', workoutId)
              .single();
              
            if (error) throw error;
            return data;
          },
          TIMEOUT_MS
        );
      } catch (checkError) {
        console.error("Error or timeout checking workout status:", checkError);
        throw new Error("Não foi possível verificar o estado do treino");
      }
      
      if (workoutData?.completed_at) {
        console.log("Workout already completed, skipping update");
        return true; // Workout already completed, return success
      }
      
      const userId = workoutData?.user_id;
      if (!userId) {
        console.error("No user ID associated with workout");
        throw new Error("Treino sem usuário associado");
      }
      
      // Update workout with completion status
      try {
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .update({
                completed_at: new Date().toISOString(),
                duration_seconds: elapsedTime
              })
              .eq('id', workoutId);
              
            if (error) throw error;
            return true;
          },
          TIMEOUT_MS
        );
      } catch (updateError) {
        console.error("Error or timeout finishing workout:", updateError);
        throw new Error("Não foi possível salvar o treino finalizado");
      }

      // Get workout exercises and details for XP calculation
      let exercises: WorkoutExercise[] = [];
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
        
        exercises = Object.values(exerciseMap);
      } catch (exercisesError) {
        console.error("Error fetching workout exercises:", exercisesError);
        // Continue with empty exercises array, we'll still award minimal XP
      }

      // Get user profile data to determine class and streak
      let userProfile;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('class, streak')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        userProfile = profile;
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Continue with default values
      }

      // RPG System integration
      try {
        // Step 1: Update user streak
        await StreakService.updateStreak(userId);
        
        // Step 2: Get workout level (defaulting to intermediate)
        let difficultyLevel: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario';
        if (workoutData.routine_id) {
          try {
            const { data: routineData } = await supabase
              .from('routines')
              .select('level')
              .eq('id', workoutData.routine_id)
              .single();
              
            if (routineData?.level) {
              // Map the exercise level to our difficulty levels
              const level = routineData.level.toLowerCase();
              if (level === 'beginner' || level === 'iniciante') {
                difficultyLevel = 'iniciante';
              } else if (level === 'advanced' || level === 'avancado') {
                difficultyLevel = 'avancado';
              } else {
                difficultyLevel = 'intermediario';
              }
            }
          } catch (routineError) {
            console.error("Error fetching routine level:", routineError);
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
        // Calculate base XP
        const baseXP = XPService.calculateWorkoutXP(
          { id: workoutId, exercises, durationSeconds: elapsedTime, difficulty: difficultyLevel },
          userProfile?.class,
          userProfile?.streak || 0,
          difficultyLevel
        );
        
        // Award XP with PR bonuses
        await XPService.awardXP(userId, baseXP, personalRecords);
        
        // Step 5: Check for achievements
        await AchievementService.checkAchievements(userId);
      } catch (rpgError) {
        // Log but don't fail the workout completion
        console.error("Error processing RPG rewards:", rpgError);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    }
  };
  
  return {
    finishWorkout
  };
};
