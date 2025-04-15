
import { Achievement, AchievementCategory, AchievementRank, toAchievementCategory, toAchievementRank } from '@/types/achievementTypes';

/**
 * Maps database achievement record to the Achievement model
 */
export function mapDbAchievementToModel(dbAchievement: any): Achievement {
  return {
    id: dbAchievement.id,
    name: dbAchievement.name,
    description: dbAchievement.description,
    category: toAchievementCategory(dbAchievement.category),
    rank: toAchievementRank(dbAchievement.rank),
    points: dbAchievement.points,
    xpReward: dbAchievement.xp_reward,
    iconName: dbAchievement.icon_name,
    requirements: dbAchievement.requirements,
    stringId: dbAchievement.string_id,
    isUnlocked: false
  };
}

/**
 * Maps Achievement model to database record format
 */
export function mapModelToDbAchievement(achievement: Achievement): any {
  return {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    category: achievement.category,
    rank: achievement.rank,
    points: achievement.points,
    xp_reward: achievement.xpReward,
    icon_name: achievement.iconName,
    requirements: achievement.requirements,
    string_id: achievement.stringId
  };
}
