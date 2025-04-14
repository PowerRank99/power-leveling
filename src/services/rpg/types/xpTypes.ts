
/**
 * Type definitions for the XP calculation system
 */

import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from './classTypes';

/**
 * Represents XP breakdown for a workout
 */
export interface XPBreakdown {
  /** Base XP earned before any multipliers */
  baseXP: number;
  
  /** XP from time-based calculations */
  timeXP?: number;
  
  /** XP from exercise completions */
  exerciseXP?: number;
  
  /** XP from set completions */
  setsXP?: number;
  
  /** XP from personal records */
  prBonus?: number;
  
  /** XP from streak bonuses */
  streakBonus?: number;
  
  /** Final XP after all bonuses and caps */
  totalXP: number;
  
  /** List of all applied bonuses */
  bonusBreakdown: ClassBonusBreakdown[];
  
  /** Whether the daily XP cap was reached */
  cappedAtDaily?: boolean;
}

/**
 * Difficulty levels for workouts
 */
export type WorkoutDifficulty = 'iniciante' | 'intermediario' | 'avancado';

/**
 * Input data for XP calculations
 */
export interface XPCalculationInput {
  /** Workout data including exercises and duration */
  workout: {
    id: string;
    exercises: WorkoutExercise[];
    durationSeconds: number;
    difficulty?: WorkoutDifficulty;
    hasPR?: boolean;
  };
  
  /** User's class selection */
  userClass?: string | null;
  
  /** Current streak count in days */
  streak?: number;
  
  /** Workout difficulty if not specified in the workout */
  defaultDifficulty?: WorkoutDifficulty;
}

/**
 * Result of XP calculation
 */
export interface XPCalculationResult {
  /** Total XP awarded */
  totalXP: number;
  
  /** Base XP before bonuses */
  baseXP: number;
  
  /** Breakdown of all bonuses applied */
  bonusBreakdown: ClassBonusBreakdown[];
}

/**
 * Time-based XP tier definition
 */
export interface XPTimeTier {
  /** Minutes threshold for this tier */
  minutes: number;
  
  /** XP awarded for this tier */
  xp: number;
}

/**
 * Constants for XP multipliers by difficulty
 */
export interface DifficultyMultipliers {
  iniciante: number;
  intermediario: number;
  avancado: number;
}
