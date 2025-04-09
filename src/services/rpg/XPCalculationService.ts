
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Service responsible for XP calculations and constants
 */
export class XPCalculationService {
  // XP system constants
  static readonly DAILY_XP_CAP = 300;
  static readonly BASE_TIME_XP_RATE = 10; // XP per 10 minutes
  static readonly BASE_EXERCISE_XP = 5; // XP per exercise
  static readonly BASE_SET_XP = 2; // XP per set
  static readonly PR_BONUS_XP = 50; // Bonus XP for personal records
  
  // Difficulty multipliers
  static readonly DIFFICULTY_MULTIPLIERS = {
    iniciante: 0.8,
    intermediario: 1.0,
    avancado: 1.5,
  };
  
  /**
   * Calculate the streak multiplier (5% per day up to 35% at 7 days)
   */
  static getStreakMultiplier(streak: number): number {
    const maxStreakBonus = 7;
    const bonusPerDay = 0.05;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
  
  /**
   * Calculate XP for a completed workout
   * @param workout Workout data
   * @param userClass User's selected class
   * @param streak Current workout streak
   * @param difficulty Workout difficulty level
   */
  static calculateWorkoutXP(
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    },
    userClass?: string | null,
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): number {
    try {
      // Base XP calculation
      const timeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
      const baseTimeXP = Math.floor(timeMinutes / 10) * this.BASE_TIME_XP_RATE; // 10 XP per 10 minutes
      const exerciseXP = workout.exercises.length * this.BASE_EXERCISE_XP; // 5 XP per exercise
      
      // Calculate sets XP
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      const setsXP = completedSets * this.BASE_SET_XP; // 2 XP per completed set
      
      // Sum base XP
      let totalXP = baseTimeXP + exerciseXP + setsXP;
      
      // Apply difficulty modifier if available
      const workoutDifficulty = workout.difficulty || difficulty;
      if (workoutDifficulty in this.DIFFICULTY_MULTIPLIERS) {
        totalXP = Math.round(totalXP * this.DIFFICULTY_MULTIPLIERS[workoutDifficulty as keyof typeof this.DIFFICULTY_MULTIPLIERS]);
      }
      
      // Cap at daily maximum
      return Math.min(totalXP, this.DAILY_XP_CAP);
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return 50; // Default XP on error
    }
  }
}
