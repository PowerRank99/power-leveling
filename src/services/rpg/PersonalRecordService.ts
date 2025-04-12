
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord, DatabaseResult } from '@/types/workout';
import { toast } from 'sonner';
import { TransactionService } from '../common/TransactionService';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { AchievementProgressService } from './achievements/AchievementProgressService';

/**
 * Service for handling personal records
 */
export class PersonalRecordService {
  /**
   * Check workout for personal records
   */
  static async checkForPersonalRecords(
    userId: string,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    }
  ): Promise<PersonalRecord[]> {
    const newRecords: PersonalRecord[] = [];

    // Optimize by fetching all current records in a single query
    const { data: currentRecords, error: recordsError } = await supabase
      .from('personal_records')
      .select('exercise_id, weight')
      .eq('user_id', userId)
      .in('exercise_id', workout.exercises.map(e => e.exerciseId).filter(Boolean));

    if (recordsError) {
      console.error('Error fetching personal records:', recordsError);
      return [];
    }

    // Create a map for faster lookups
    const recordsMap = new Map();
    currentRecords?.forEach(record => {
      recordsMap.set(record.exercise_id, record.weight);
    });

    for (const exercise of workout.exercises) {
      if (!exercise.exerciseId) continue;

      try {
        // Get the maximum weight lifted in this workout for the exercise
        let maxWeight = 0;
        if (Array.isArray(exercise.sets)) {
          for (const set of exercise.sets) {
            const weight = parseFloat(set.weight);
            if (!isNaN(weight) && weight > maxWeight) {
              maxWeight = weight;
            }
          }
        }

        if (maxWeight === 0) continue;

        // Compare with current personal record using the map
        const currentWeight = recordsMap.get(exercise.exerciseId) || 0;
        
        if (maxWeight > currentWeight) {
          newRecords.push({
            exerciseId: exercise.exerciseId,
            weight: maxWeight,
            previousWeight: currentWeight
          });
        }
      } catch (error) {
        console.error('Error checking personal records:', error);
      }
    }

    return newRecords;
  }

  /**
   * Record a personal record with transaction support
   * Ensures personal record is recorded and achievements are updated atomically
   */
  static async recordPersonalRecord(
    userId: string,
    exerciseId: string,
    weight: number,
    previousWeight: number
  ): Promise<DatabaseResult<PersonalRecord>> {
    try {
      // Use transaction service for atomicity
      const { data, error } = await TransactionService.executeTransaction(async () => {
        // Record the personal record
        const { error } = await supabase
          .from('personal_records')
          .upsert(
            {
              user_id: userId,
              exercise_id: exerciseId,
              weight: weight,
              previous_weight: previousWeight,
              recorded_at: new Date().toISOString()
            },
            { onConflict: 'user_id, exercise_id' }
          );

        if (error) throw error;

        // Get total PR count for achievement progress in a single query
        const { count, error: countError } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (countError) throw countError;
        
        // Update achievement progress for PR count
        if (count) {
          await AchievementProgressService.updatePersonalRecordProgress(userId, count);
        }
        
        // Calculate weight increase percentage for PR increase achievements
        if (previousWeight > 0) {
          const increasePercentage = ((weight - previousWeight) / previousWeight) * 100;
          
          if (increasePercentage >= 10) {
            await AchievementCheckerService.checkPersonalRecordAchievements(userId, {
              exerciseId,
              weight,
              previousWeight
            });
          }
        }

        // Return the PR data
        return {
          exerciseId: exerciseId,
          weight: weight,
          previousWeight: previousWeight
        };
      });

      if (error) {
        console.error('Error recording personal record in transaction:', error);
        toast.error('Erro ao salvar recorde pessoal', {
          description: 'Não foi possível salvar o novo recorde pessoal.'
        });
        return { success: false, error };
      }

      toast.success('Novo recorde pessoal!', {
        description: `Você levantou ${weight}kg, superando seu recorde anterior de ${previousWeight}kg!`
      });

      return {
        success: true,
        data: data as PersonalRecord
      };
    } catch (error) {
      console.error('Error recording personal record:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user personal records
   */
  static async getUserPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user personal records:', error);
        return [];
      }

      return data.map(record => ({
        exerciseId: record.exercise_id,
        weight: record.weight,
        previousWeight: record.previous_weight
      }));
    } catch (error) {
      console.error('Error fetching user personal records:', error);
      return [];
    }
  }
}
