
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
  isUnlocked?: boolean; // Added to address AchievementGrid error
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

// Added to address AchievementNotification errors
export interface AchievementNotification {
  achievement: Achievement;
  timestamp: string;
}

export type AchievementRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
