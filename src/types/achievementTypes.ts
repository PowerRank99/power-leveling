
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

export type AchievementRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
