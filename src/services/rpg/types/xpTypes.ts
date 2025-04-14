
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Interface for time-based XP tiers with diminishing returns
 */
export interface XPTimeTier {
  minutes: number;
  xp: number;
}

/**
 * Type for XP breakdown items
 */
export interface XPBonusItem {
  skill: string;
  amount: number;
  description: string;
}

/**
 * XP calculation components breakdown
 */
export interface XPComponents {
  timeXP: number;
  exerciseXP: number;
  setsXP: number;
  prBonus: number;
  totalBaseXP: number;
}

/**
 * Input for XP calculation
 */
export interface XPCalculationInput {
  workout: {
    id: string;
    exercises: WorkoutExercise[];
    durationSeconds: number;
    hasPR?: boolean;
  };
  userClass?: string | null;
  streak?: number;
  defaultDifficulty?: string;
  userId?: string;
}

/**
 * Result of XP calculation
 */
export interface XPCalculationResult {
  totalXP: number;
  baseXP: number;
  bonusBreakdown: XPBonusItem[];
  components?: XPComponents;
}
