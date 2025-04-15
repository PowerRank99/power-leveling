
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { mapToAchievementCategory, mapToAchievementRank } from '@/types/achievementMappers';

export class TestAchievementUtils {
  static createMockAchievement(overrides: Partial<Achievement> = {}): Achievement {
    return {
      id: 'test-achievement-id',
      name: 'Test Achievement',
      description: 'Test Achievement Description',
      category: AchievementCategory.WORKOUT,
      rank: AchievementRank.E,
      points: 10,
      xpReward: 100,
      iconName: 'test-icon',
      requirements: { type: 'count', value: 1 },
      ...overrides
    };
  }
  
  static mockAchievementMapping(rawData: any): Achievement {
    return {
      id: rawData.id,
      name: rawData.name,
      description: rawData.description,
      category: mapToAchievementCategory(rawData.category),
      rank: mapToAchievementRank(rawData.rank),
      points: rawData.points,
      xpReward: rawData.xp_reward,
      iconName: rawData.icon_name,
      requirements: rawData.requirements,
      stringId: rawData.string_id
    };
  }
}
