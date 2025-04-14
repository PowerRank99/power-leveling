
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XPService } from '@/services/rpg/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';

interface WorkoutParams {
  workoutType: string;
  duration: number;
  exerciseCount: number;
  difficultyLevel: string;
  includePersonalRecord: boolean;
  streak: number;
  useClassPassives: boolean;
  selectedClass: string | null;
}

interface SubmitWorkoutParams {
  awardedXP: number;
  workout: WorkoutParams;
}

export class WorkoutSubmissionService {
  private userId: string;
  private addLogEntry: (action: string, details: string) => void;

  constructor(userId: string, addLogEntry: (action: string, details: string) => void) {
    this.userId = userId;
    this.addLogEntry = addLogEntry;
  }

  public async submitWorkout({ awardedXP, workout }: SubmitWorkoutParams): Promise<void> {
    if (!this.userId) {
      toast.error('Error', {
        description: 'Please select a test user',
      });
      return;
    }
    
    try {
      // Create workout record
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: this.userId,
          started_at: new Date(Date.now() - workout.duration * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: workout.duration * 60
        })
        .select('id')
        .single();
      
      if (workoutError) throw workoutError;
      
      const workoutId = workoutData.id;
      
      // Create exercise sets
      await this.createExerciseSets(workoutId, workout.exerciseCount);
      
      // Award XP
      const metadata = {
        workoutType: workout.workoutType,
        exerciseCount: workout.exerciseCount,
        difficultyLevel: workout.difficultyLevel,
        includePersonalRecord: workout.includePersonalRecord,
        ...(workout.useClassPassives ? { class: workout.selectedClass } : {})
      };
      
      await XPService.awardXP(this.userId, awardedXP, 'workout', metadata);
      
      // Create personal record if needed
      if (workout.includePersonalRecord) {
        await this.createPersonalRecord();
      }
      
      // Check achievements
      await AchievementService.checkWorkoutAchievements(this.userId, workoutId);
      
      // Log success
      this.logSuccess(workout, awardedXP);
      
      toast.success('Workout Simulated!', {
        description: `${awardedXP} XP has been awarded to the user.`,
      });
    } catch (error) {
      console.error('Error simulating workout:', error);
      toast.error('Error', {
        description: 'Failed to simulate workout',
      });
      throw error;
    }
  }

  private async createExerciseSets(workoutId: string, exerciseCount: number): Promise<void> {
    const exercisePromises = [];
    
    for (let i = 0; i < exerciseCount; i++) {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .limit(10);
      
      if (exercises && exercises.length > 0) {
        const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
        
        exercisePromises.push(
          supabase
            .from('workout_sets')
            .insert({
              workout_id: workoutId,
              exercise_id: randomExercise.id,
              set_order: i + 1,
              weight: 20 + Math.floor(Math.random() * 80),
              reps: 8 + Math.floor(Math.random() * 8),
              completed: true,
              completed_at: new Date().toISOString()
            })
        );
      }
    }
    
    await Promise.all(exercisePromises);
  }

  private async createPersonalRecord(): Promise<void> {
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);
    
    if (exercises && exercises.length > 0) {
      await supabase
        .from('personal_records')
        .insert({
          user_id: this.userId,
          exercise_id: exercises[0].id,
          weight: 100,
          previous_weight: 80
        });
    }
  }

  private logSuccess(workout: WorkoutParams, awardedXP: number): void {
    const classInfo = workout.useClassPassives ? `, Class: ${workout.selectedClass}` : '';
    
    this.addLogEntry(
      'Workout Simulated', 
      `Type: ${workout.workoutType}, Duration: ${workout.duration}min, Exercises: ${workout.exerciseCount}, XP: ${awardedXP}, Streak: ${workout.streak}${classInfo}`
    );
  }
}
