
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Type for workout difficulty levels
 */
export type WorkoutDifficulty = 'iniciante' | 'intermediario' | 'avancado';

/**
 * Interface for time-based XP tiers with diminishing returns
 */
export interface XPTimeTier {
  minutes: number;
  xp: number;
}

/**
 * Type for difficulty multipliers
 */
export type DifficultyMultipliers = {
  [key in WorkoutDifficulty]: number;
};

/**
 * Type for XP breakdown items
 */
export interface XPBonusItem {
  skill: string;
  amount: number;
  description: string;
}

/**
 * Input for XP calculation
 */
export interface XPCalculationInput {
  workout: {
    id: string;
    exercises: WorkoutExercise[];
    durationSeconds: number;
    difficulty?: WorkoutDifficulty;
    hasPR?: boolean;
  };
  userClass?: string | null;
  streak?: number;
  defaultDifficulty?: WorkoutDifficulty;
  userId?: string;
}

/**
 * Result of XP calculation
 */
export interface XPCalculationResult {
  totalXP: number;
  baseXP: number;
  bonusBreakdown: XPBonusItem[];
}
