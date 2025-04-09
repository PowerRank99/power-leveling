
/**
 * Core RPG system types for fitness gamification
 */

// User's RPG class definition
export type RPGClassName = 'warrior' | 'rogue' | 'mage' | 'ranger' | 'cleric';

export interface RPGClass {
  name: RPGClassName;
  title: string;
  description: string;
  primaryBonus: string;
  secondaryBonus: string;
  iconName: string;
}

// Achievement related types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'workout' | 'strength' | 'endurance' | 'consistency' | 'social';
  xpReward: number;
  iconName: string;
  requirements: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  achievedAt: string;
}

// Class bonus system
export interface ClassBonus {
  id: string;
  className: RPGClassName;
  bonusType: 'strength' | 'endurance' | 'recovery' | 'consistency' | 'xp';
  bonusValue: number;
  description: string;
}

// Level progression data
export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title?: string;
}

// Workout-related types with RPG data
export interface WorkoutRPGData {
  baseXP: number;
  bonuses: {
    streakBonus: number;
    classBonus: number;
    achievementBonus: number;
    totalBonus: number;
  };
  totalXP: number;
  achievements: Achievement[];
  levelUp: boolean;
  newLevel?: number;
}

// User profile with RPG data
export interface RPGProfile {
  id: string;
  name: string | null;
  level: number;
  xp: number;
  title: string | null;
  class: RPGClassName | null;
  classSelectedAt: string | null;
  streak: number;
  lastWorkoutAt: string | null;
  equippedItems: Record<string, any>;
  nextLevelXP: number;
  xpProgress: number;
}

// Competition data
export interface Competition {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  type: string;
  status: 'pending' | 'active' | 'completed';
  rules: Record<string, any> | null;
  createdBy: string;
  createdAt: string;
}
