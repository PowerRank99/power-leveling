import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, WorkoutExerciseData } from '@/types/workoutTypes';
import { XPService } from '../rpg/XPService';
import { StreakService } from '../rpg/StreakService'; 
import { ExerciseHistoryService } from '../ExerciseHistoryService';
import { toast } from 'sonner';
import { PersonalRecordService } from '../rpg/PersonalRecordService';
import { AchievementCheckerService } from '../rpg/achievements/AchievementCheckerService';
import { WorkoutExerciseService } from './WorkoutExerciseService';
import { mapToWorkoutExercise, mapToWorkoutExerciseData } from '@/utils/typeMappers';

/**
 * Service for handling workout completion
 */
export class WorkoutCompletionService {
  /**
   * Complete a workout and handle all related operations
   */
  static async completeWorkout(
    userId: string,
    workoutId: string,
    exercises: WorkoutExercise[],
    duration: number,
    notes?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!userId || !workoutId) {
        console.error('Missing required parameters for workout completion');
        return false;
      }
      
      // 1. Mark workout as completed in the database
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ 
          completed_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('id', workoutId);
        
      if (updateError) {
        console.error('Error updating workout completion:', updateError);
        return false;
      }
      
      // 2. Save exercise history entries
      // Convert to compatible format first
      const exerciseDataList = exercises.map(exercise => {
        if (Array.isArray(exercise.sets)) {
          // Get weight and reps from first set (for backwards compatibility)
          const firstSet = exercise.sets[0];
          const weight = firstSet ? parseFloat(firstSet.weight) : 0;
          const reps = firstSet ? parseInt(firstSet.reps) : 0;
          // Count completed sets
          const completedSets = exercise.sets.filter(set => set.completed).length;
          
          return {
            exerciseId: exercise.exerciseId || exercise.id,
            weight,
            reps,
            sets: completedSets
          };
        } else {
          // Handle old format if present
          return {
            exerciseId: exercise.exerciseId || exercise.id,
            weight: (exercise as any).weight || 0,
            reps: (exercise as any).reps || 0,
            sets: (exercise as any).sets || 0
          };
        }
      });
      
      await Promise.all(exerciseDataList.map(exercise => 
        ExerciseHistoryService.updateExerciseHistory(
          exercise.exerciseId,
          exercise.weight || 0,
          exercise.reps || 0,
          exercise.sets || 0
        )
      ));
      
      // 3. Update workout streak
      await StreakService.updateStreak(userId);
      
      // 4. Check for personal records and award bonuses
      const personalRecords = await PersonalRecordService.checkForPersonalRecords(
        userId,
        {
          id: workoutId,
          exercises,
          durationSeconds: duration
        } as { id: string; exercises: WorkoutExercise[]; durationSeconds: number }
      );
      
      for (const record of personalRecords) {
        await PersonalRecordService.recordPersonalRecord(
          userId,
          record.exerciseId,
          record.weight,
          record.previousWeight
        );
      }
      
      // 5. Award XP for the workout
      // Convert to compatible format for XP service if needed
      const workoutData = {
        id: workoutId,
        exercises: exercises,
        durationSeconds: duration
      };
      
      const xpAwarded = await XPService.awardWorkoutXP(userId, workoutData, duration);
      
      // 6. Check for workout-related achievements
      await AchievementCheckerService.checkWorkoutRelatedAchievements(userId, workoutData);
      
      // 7. Save workout notes if any
      if (notes && Object.keys(notes).length > 0) {
        // Implement notes saving if needed
      }
      
      // 8. Show success toast
      toast.success('Treino concluído!', {
        description: 'Seu treino foi registrado com sucesso.'
      });
      
      return true;
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Erro ao concluir treino', {
        description: 'Ocorreu um erro ao registrar seu treino.'
      });
      return false;
    }
  }

  /**
   * Finish a workout with the current user
   */
  static async finishWorkout(workoutId: string, duration: number): Promise<boolean> {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('No authenticated user found');
        return false;
      }

      // Get workout exercise data
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', workoutId);
        
      if (exercisesError) {
        console.error('Error fetching workout exercises:', exercisesError);
        return false;
      }
      
      // Transform data to WorkoutExercise format
      const exercises: WorkoutExercise[] = [];
      const processedExercises = new Set<string>();
      
      exercisesData?.forEach(set => {
        if (set.exercise_id && !processedExercises.has(set.exercise_id)) {
          processedExercises.add(set.exercise_id);
          
          const exerciseSets = exercisesData.filter(s => s.exercise_id === set.exercise_id);
          const completedSets = exercisesData.filter(s => s.exercise_id === set.exercise_id && s.completed).length;
          
          // Create a proper WorkoutExercise object with an array of sets
          exercises.push({
            id: set.exercise_id,
            name: `Exercise ${set.exercise_id.slice(0, 8)}`, // Default name
            exerciseId: set.exercise_id,
            sets: exerciseSets.map(s => ({
              id: s.id,
              weight: s.weight?.toString() || '0',
              reps: s.reps?.toString() || '0',
              completed: s.completed || false,
              set_order: s.set_order,
            }))
          });
        }
      });
      
      // Process workout exercises
      await WorkoutExerciseService.processWorkoutExercises(workoutId);
      
      // Complete the workout
      return await this.completeWorkout(
        userData.user.id,
        workoutId,
        exercises,
        duration
      );
    } catch (error) {
      console.error('Error in finishWorkout:', error);
      toast.error('Erro ao finalizar treino', {
        description: 'Ocorreu um erro ao finalizar seu treino.'
      });
      return false;
    }
  }
  
  /**
   * Discard a workout
   */
  static async discardWorkout(workoutId: string): Promise<boolean> {
    try {
      if (!workoutId) {
        console.error('No workout ID provided');
        return false;
      }
      
      // Delete workout sets first (due to foreign key constraints)
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        return false;
      }
      
      // Delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error('Error deleting workout:', workoutError);
        return false;
      }
      
      toast.success('Treino descartado', {
        description: 'O treino foi descartado com sucesso'
      });
      
      return true;
    } catch (error) {
      console.error('Error discarding workout:', error);
      toast.error('Erro ao descartar treino', {
        description: 'Ocorreu um erro ao descartar o treino'
      });
      return false;
    }
  }
}
