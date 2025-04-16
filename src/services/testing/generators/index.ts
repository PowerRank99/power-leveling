
/**
 * Achievement Test Data Generators
 * Specialized utilities to simulate user actions for testing achievements
 */

import { WorkoutGenerator, WorkoutGenerationOptions, WorkoutSeriesOptions, WorkoutWithPROptions } from './WorkoutGenerator';
import { StreakGenerator, StreakPatternOptions } from './StreakGenerator';
import { PRGenerator, PROptions, PRProgressionOptions, MultiExercisePROptions } from './PRGenerator';
import { ClassGenerator, ClassChangeHistoryOptions } from './ClassGenerator';
import { ActivityGenerator, ManualWorkoutOptions, ActivityMixOptions } from './ActivityGenerator';

/**
 * Common interface for all generator cleanup operations
 */
export interface CleanupOptions {
  /** Whether to show toast messages during cleanup */
  silent?: boolean;
  /** Tag used to identify test data (default: 'test-data') */
  testDataTag?: string;
}

/**
 * Base interface for test data generators
 */
export interface TestDataGenerator {
  cleanup(userId: string, options?: CleanupOptions): Promise<boolean>;
  getGenerators?(): any[];
}

/**
 * Central interface for all generators
 */
export interface TestDataGenerators {
  workout: WorkoutGenerator;
  streak: StreakGenerator;
  pr: PRGenerator;
  class: ClassGenerator;
  activity: ActivityGenerator;
}

/**
 * Common options for all generator operations
 */
export interface GeneratorOptions {
  /** 
   * Whether this is test data that should be marked for easy cleanup
   * Default: true
   */
  isTestData?: boolean;
  /** 
   * Tag to add to test data for identification
   * Default: 'test-data'
   */
  testDataTag?: string;
  /** 
   * Whether to show toast notifications during operations
   * Default: false
   */
  silent?: boolean;
}

/**
 * Base result interface for all generator operations
 */
export interface GeneratorResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Generated record IDs */
  ids?: string[];
}

/**
 * Initializes all test data generators
 */
export function createTestDataGenerators(): TestDataGenerators {
  return {
    workout: new WorkoutGenerator(),
    streak: new StreakGenerator(),
    pr: new PRGenerator(),
    class: new ClassGenerator(),
    activity: new ActivityGenerator()
  };
}

/**
 * Utility function to generate random date in the past
 * @param daysBack Maximum number of days in the past
 * @returns Date object
 */
export function getRandomPastDate(daysBack: number = 30): Date {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  date.setDate(date.getDate() - randomDays);
  return date;
}

/**
 * Utility function to generate sequential dates
 * @param startDate Starting date
 * @param days Number of days to generate
 * @param skipDays Array of day indices to skip (0-based)
 * @returns Array of dates
 */
export function generateSequentialDates(startDate: Date, days: number, skipDays: number[] = []): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    if (!skipDays.includes(i)) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
  }
  
  return dates;
}

/**
 * Utility function to format a date for database operations
 * @param date Date object
 * @returns ISO string formatted date
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString();
}

// Export all generators
export { WorkoutGenerator, StreakGenerator, PRGenerator, ClassGenerator, ActivityGenerator };

// Export types with the 'export type' syntax for isolatedModules compliance
export type { WorkoutGenerationOptions };
export type { WorkoutSeriesOptions };
export type { WorkoutWithPROptions };
export type { StreakPatternOptions };
export type { PROptions };
export type { PRProgressionOptions };
export type { MultiExercisePROptions };
export type { ClassChangeHistoryOptions };
export type { ManualWorkoutOptions };
export type { ActivityMixOptions };
