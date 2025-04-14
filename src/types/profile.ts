
/**
 * Profile data types for the user profile and dashboard
 */

export interface ProfileData {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  className: string;
  classDescription: string;
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string;
  xpGain: number;
  streak: number;
  achievementPoints: number;
  rank: string;
  ranking: number;
}

export interface ClassBonus {
  description: string;
  value: string;
}

export interface ProfileClassData {
  className: string;
  description: string;
  bonuses: ClassBonus[];
}
