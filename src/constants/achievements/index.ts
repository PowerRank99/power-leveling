
import { WORKOUT_ACHIEVEMENTS } from './categories/WorkoutAchievements';
import { STREAK_ACHIEVEMENTS } from './categories/StreakAchievements';
import { RECORD_ACHIEVEMENTS } from './categories/RecordAchievements';
import { GUILD_ACHIEVEMENTS } from './categories/GuildAchievements';
import { MANUAL_ACHIEVEMENTS } from './categories/ManualAchievements';
import { VARIETY_ACHIEVEMENTS } from './categories/VarietyAchievements'; 
import { LEVEL_ACHIEVEMENTS } from './categories/LevelAchievements';
import { XP_ACHIEVEMENTS } from './categories/XPAchievements';
import { SPECIAL_ACHIEVEMENTS } from './categories/SpecialAchievements';
import { AchievementDefinition } from './AchievementSchema';
import { AchievementUtils } from './AchievementUtils';

// Combine all achievements into a single object
export const ACHIEVEMENTS = {
  WORKOUTS: WORKOUT_ACHIEVEMENTS,
  STREAK: STREAK_ACHIEVEMENTS, 
  RECORDS: RECORD_ACHIEVEMENTS,
  GUILD: GUILD_ACHIEVEMENTS,
  MANUAL: MANUAL_ACHIEVEMENTS,
  VARIETY: VARIETY_ACHIEVEMENTS,
  LEVEL: LEVEL_ACHIEVEMENTS,
  XP: XP_ACHIEVEMENTS,
  SPECIAL: SPECIAL_ACHIEVEMENTS
};

// Re-export everything for backward compatibility
export * from './AchievementSchema';
export { AchievementUtils };
