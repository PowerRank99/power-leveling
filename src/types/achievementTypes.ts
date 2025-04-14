
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Achievement interface for consistent usage across the app
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: string;
  points: number;
  xpReward: number;
  iconName: string;
  requirements: any;
  isUnlocked?: boolean;
  achievedAt?: string;
}

/**
 * Achievement progress interface
 */
export interface AchievementProgress {
  id: string;
  current: number;
  total: number;
  isComplete: boolean;
}

/**
 * Achievement notification interface
 */
export interface AchievementNotification {
  id: string;
  achievement?: Achievement;
  title?: string;
  description?: string;
  rank: string;
  points: number;
  xpReward: number;
  bonusText?: string;
  iconName?: string;
  timestamp: string;
}

/**
 * Achievement rank type
 */
export type AchievementRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

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
    requirements: any;
  };
}
