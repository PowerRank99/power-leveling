
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord, DatabaseResult } from '@/types/workout';
import { toast } from 'sonner';

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

    for (const exercise of workout.exercises) {
      if (!exercise.exerciseId) continue;

      try {
        // Get the user's current personal record for this exercise
        const { data: currentRecord, error: recordError } = await supabase
          .from('personal_records')
          .select('weight')
          .eq('user_id', userId)
          .eq('exercise_id', exercise.exerciseId)
          .single();

        if (recordError && recordError.code !== '404') {
          console.error('Error fetching personal record:', recordError);
          continue;
        }

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

        // Compare with current personal record
        if (!currentRecord || maxWeight > currentRecord.weight) {
          newRecords.push({
            exerciseId: exercise.exerciseId,
            weight: maxWeight,
            previousWeight: currentRecord ? currentRecord.weight : 0
          });
        }
      } catch (error) {
        console.error('Error checking personal records:', error);
      }
    }

    return newRecords;
  }

  /**
   * Record a personal record
   */
  static async recordPersonalRecord(
    userId: string,
    exerciseId: string,
    weight: number,
    previousWeight: number
  ): Promise<DatabaseResult<PersonalRecord>> {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .upsert(
          {
            user_id: userId,
            exercise_id: exerciseId,
            weight: weight,
            previous_weight: previousWeight
          },
          { onConflict: 'user_id, exercise_id' }
        )
        .select();

      if (error) {
        console.error('Error recording personal record:', error);
        toast.error('Erro ao salvar recorde pessoal', {
          description: 'Não foi possível salvar o novo recorde pessoal.'
        });
        return { success: false, error: error };
      }

      toast.success('Novo recorde pessoal!', {
        description: `Você levantou ${weight}kg, superando seu recorde anterior de ${previousWeight}kg!`
      });

      return {
        success: true,
        data: {
          exerciseId: exerciseId,
          weight: weight,
          previousWeight: previousWeight
        }
      };
    } catch (error) {
      console.error('Error recording personal record:', error);
      return { success: false, error: error };
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
