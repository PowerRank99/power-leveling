
import { WorkoutExercise } from '@/types/workoutTypes';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService, PersonalRecord } from './PersonalRecordService';
import { XPBonusService } from './XPBonusService';

/**
 * Main XP Service that coordinates XP calculations and awards
 */
export class XPService {
  // Re-export constants for backward compatibility
  static readonly DAILY_XP_CAP = XPCalculationService.DAILY_XP_CAP;
  static readonly PR_BONUS_XP = XPCalculationService.PR_BONUS_XP;
  static readonly BASE_EXERCISE_XP = XPCalculationService.BASE_EXERCISE_XP;
  static readonly BASE_SET_XP = XPCalculationService.BASE_SET_XP;
  static readonly DIFFICULTY_MULTIPLIERS = XPCalculationService.DIFFICULTY_MULTIPLIERS;
  static readonly TIME_XP_TIERS = XPCalculationService.TIME_XP_TIERS;
  
  /**
   * Calculate XP for a completed workout
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
    return XPCalculationService.calculateWorkoutXP(workout, userClass, streak, difficulty);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   */
  static calculateTimeXP(durationMinutes: number): number {
    return XPCalculationService.calculateTimeXP(durationMinutes);
  }
  
  /**
   * Check for personal records
   */
  static async checkForPersonalRecords(
    userId: string, 
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    }
  ): Promise<PersonalRecord[]> {
    return PersonalRecordService.checkForPersonalRecords(userId, workout);
  }
  
  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    personalRecords: PersonalRecord[] = []
  ): Promise<boolean> {
    return XPBonusService.awardXP(userId, baseXP, personalRecords);
  }
  
  /**
   * Helper method for getting streak multiplier
   */
  static getStreakMultiplier(streak: number): number {
    return XPCalculationService.getStreakMultiplier(streak);
  }
}
