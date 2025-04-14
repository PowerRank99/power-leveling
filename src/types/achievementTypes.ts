
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Achievement categories enum for better type safety
 */
export enum AchievementCategory {
  WORKOUT = 'workout',
  STREAK = 'streak',
  RECORD = 'record',
  XP = 'xp',
  LEVEL = 'level',
  GUILD = 'guild',
  SPECIAL = 'special',
  VARIETY = 'variety',
  MANUAL = 'manual',
  TIME_BASED = 'time_based',
  MILESTONE = 'milestone'
}

/**
 * Achievement rank type with clear definitions
 */
export type AchievementRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'Unranked';

/**
 * Strongly typed requirement structure
 */
export interface AchievementRequirement {
  type: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Achievement interface for consistent usage across the app
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory | string;
  rank: AchievementRank;
  points: number;
  xpReward: number;
  iconName: string;
  requirements: AchievementRequirement;
  isUnlocked?: boolean;
  achievedAt?: string;
  metadata?: Record<string, any>; // For future extensibility
}

/**
 * Achievement progress interface
 */
export interface AchievementProgress {
  id: string;
  current: number;
  total: number;
  isComplete: boolean;
  lastUpdated?: string;
}

/**
 * Achievement notification interface
 */
export interface AchievementNotification {
  id: string;
  achievement?: Achievement;
  title?: string;
  description?: string;
  rank: AchievementRank | string;
  points: number;
  xpReward: number;
  bonusText?: string;
  iconName?: string;
  timestamp: string;
}

/**
 * Achievement stats interface for user profiles
 */
export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  byRank: Record<AchievementRank, number>;
  byCategory: Partial<Record<AchievementCategory, number>>;
  recentlyUnlocked?: Achievement[];
}

/**
 * Achievement service response interface
 */
export interface AchievementBatchResult {
  successful?: string[];
  failed?: string[];
  alreadyAwarded?: string[];
}

// Update UserAchievementData interface to match Supabase query structure
export interface UserAchievementData {
  achievement_id: string;
  achieved_at: string;
  achievements: {
    id: string;
    name: string;
    description: string;
    category: string;
    rank: string;
    points: number;
    xp_reward: number;
    icon_name: string;
    requirements: AchievementRequirement;
  };
}
