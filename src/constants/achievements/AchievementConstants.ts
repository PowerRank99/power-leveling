
import { WORKOUT_ACHIEVEMENTS } from './categories/WorkoutAchievements';
import { STREAK_ACHIEVEMENTS } from './categories/StreakAchievements';
import { RECORD_ACHIEVEMENTS } from './categories/RecordAchievements';
import { GUILD_ACHIEVEMENTS } from './categories/GuildAchievements';
import { MANUAL_ACHIEVEMENTS } from './categories/ManualAchievements';
import { VARIETY_ACHIEVEMENTS } from './categories/VarietyAchievements';
import { LEVEL_ACHIEVEMENTS } from './categories/LevelAchievements';
import { XP_ACHIEVEMENTS } from './categories/XPAchievements';
import { SPECIAL_ACHIEVEMENTS } from './categories/SpecialAchievements';

/**
 * Achievement ID constants grouped by rank and category
 * This uses the structured definitions as the source of truth
 */
export const ACHIEVEMENT_IDS = {
  // Rank E achievements (basic)
  E: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'E')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'E')
      .map(a => a.id),
    manual: Object.values(MANUAL_ACHIEVEMENTS)
      .filter(a => a.rank === 'E')
      .map(a => a.id),
    guild: Object.values(GUILD_ACHIEVEMENTS)
      .filter(a => a.rank === 'E')
      .map(a => a.id)
  },
  // Rank D achievements
  D: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    record: Object.values(RECORD_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    manual: Object.values(MANUAL_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    variety: Object.values(VARIETY_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    guild: Object.values(GUILD_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    level: Object.values(LEVEL_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id),
    xp: Object.values(XP_ACHIEVEMENTS)
      .filter(a => a.rank === 'D')
      .map(a => a.id)
  },
  // Rank C achievements
  C: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    record: Object.values(RECORD_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    manual: Object.values(MANUAL_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    variety: Object.values(VARIETY_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    guild: Object.values(GUILD_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    level: Object.values(LEVEL_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id),
    xp: Object.values(XP_ACHIEVEMENTS)
      .filter(a => a.rank === 'C')
      .map(a => a.id)
  },
  // Rank B achievements
  B: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id),
    record: Object.values(RECORD_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id),
    variety: Object.values(VARIETY_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id),
    level: Object.values(LEVEL_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id),
    xp: Object.values(XP_ACHIEVEMENTS)
      .filter(a => a.rank === 'B')
      .map(a => a.id)
  },
  // Rank A achievements
  A: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'A')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'A')
      .map(a => a.id),
    record: Object.values(RECORD_ACHIEVEMENTS)
      .filter(a => a.rank === 'A')
      .map(a => a.id),
    level: Object.values(LEVEL_ACHIEVEMENTS)
      .filter(a => a.rank === 'A')
      .map(a => a.id),
    xp: Object.values(XP_ACHIEVEMENTS)
      .filter(a => a.rank === 'A')
      .map(a => a.id)
  },
  // Rank S achievements
  S: {
    workout: Object.values(WORKOUT_ACHIEVEMENTS)
      .filter(a => a.rank === 'S')
      .map(a => a.id),
    streak: Object.values(STREAK_ACHIEVEMENTS)
      .filter(a => a.rank === 'S')
      .map(a => a.id),
    level: Object.values(LEVEL_ACHIEVEMENTS)
      .filter(a => a.rank === 'S')
      .map(a => a.id),
    xp: Object.values(XP_ACHIEVEMENTS)
      .filter(a => a.rank === 'S')
      .map(a => a.id),
    special: Object.values(SPECIAL_ACHIEVEMENTS)
      .filter(a => a.rank === 'S')
      .map(a => a.id)
  }
};
