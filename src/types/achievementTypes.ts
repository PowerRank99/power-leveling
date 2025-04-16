
// Minimal placeholder types to prevent import errors
export enum AchievementCategory {
  SPECIAL = 'Special'
}

export enum AchievementRank {
  E = 'E'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rank: AchievementRank;
  points?: number;
  xpReward?: number;
}

export interface AchievementTestResult {
  id: string;
  name: string;
  category: string;
  rank: string;
  success: boolean;
  testDurationMs: number;
  testedAt: string;
}
