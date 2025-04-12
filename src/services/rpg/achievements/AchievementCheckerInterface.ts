
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Interface for personal record data to avoid circular dependency
 * This duplicates the interface from PersonalRecordService but avoids the circular import
 */
export interface PersonalRecordData {
  exerciseId: string;
  weight: number;
  previousWeight: number;
}

/**
 * Common interface for all achievement checker implementations
 */
export interface AchievementChecker {
  checkAchievements(userId: string, data?: any): Promise<ServiceResponse<void>>;
}

/**
 * Base achievement stats type used by various checker classes
 */
export interface UserWorkoutStats {
  totalCount: number;
  weeklyCount: number;
  monthlyCount: number;
}

/**
 * User profile data interface
 */
export interface UserProfileData {
  id: string;
  level: number;
  xp: number;
  streak: number;
  class?: string;
  achievements_count: number;
  achievement_points: number;
  [key: string]: any;
}
