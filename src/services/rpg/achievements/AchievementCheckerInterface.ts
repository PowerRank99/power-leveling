
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

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
  checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>>;
}

/**
 * Base achievement stats type used by various checker classes
 */
export interface UserWorkoutStats {
  totalCount: number;
  weeklyCount: number;
  monthlyCount: number;
  categoryBreakdown?: Record<string, number>;
  timeOfDay?: Record<string, number>;
  duration?: {
    averageMinutes: number;
    totalMinutes: number;
    longWorkouts: number;  // Workouts > 60 minutes
  };
}

/**
 * User profile data interface with achievement-related fields
 */
export interface UserProfileData {
  id: string;
  level: number;
  xp: number;
  streak: number;
  class?: string;
  achievements_count: number;
  achievement_points: number;
  rank?: AchievementRank;
  [key: string]: any;
}

/**
 * Achievement context interface for providing achievement checkers with context
 */
export interface AchievementCheckContext {
  userId: string;
  activityType?: string;
  workoutId?: string;
  recordData?: PersonalRecordData;
  profileData?: UserProfileData;
  customData?: Record<string, any>;
}
