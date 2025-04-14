
import { describe, it, expect } from 'vitest';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

describe('AchievementValidation', () => {
  describe('validateAchievement', () => {
    it('should validate a valid achievement', () => {
      const validAchievement = {
        id: 'test-achievement',
        name: 'Test Achievement',
        description: 'This is a test achievement',
        category: AchievementCategory.WORKOUT,
        rank: 'S' as AchievementRank,
        points: 10,
        xpReward: 100,
        iconName: 'award',
        requirementType: 'workout_count',
        requirementValue: 5
      };

      expect(AchievementUtils.validateAchievement(validAchievement)).toBe(true);
    });

    it('should reject invalid achievement ID format', () => {
      const invalidAchievement = {
        id: 'TestAchievement', // Invalid: contains uppercase
        name: 'Test Achievement',
        description: 'This is a test achievement',
        category: AchievementCategory.WORKOUT,
        rank: 'S' as AchievementRank,
        points: 10,
        xpReward: 100,
        iconName: 'award',
        requirementType: 'workout_count',
        requirementValue: 5
      };

      expect(AchievementUtils.validateAchievement(invalidAchievement)).toBe(false);
    });

    it('should reject achievement with invalid points range', () => {
      const invalidAchievement = {
        id: 'test-achievement',
        name: 'Test Achievement',
        description: 'This is a test achievement',
        category: AchievementCategory.WORKOUT,
        rank: 'S' as AchievementRank,
        points: 30, // Invalid: exceeds maximum of 25
        xpReward: 100,
        iconName: 'award',
        requirementType: 'workout_count',
        requirementValue: 5
      };

      expect(AchievementUtils.validateAchievement(invalidAchievement)).toBe(false);
    });

    it('should reject achievement with invalid XP reward range', () => {
      const invalidAchievement = {
        id: 'test-achievement',
        name: 'Test Achievement',
        description: 'This is a test achievement',
        category: AchievementCategory.WORKOUT,
        rank: 'S' as AchievementRank,
        points: 10,
        xpReward: 600, // Invalid: exceeds maximum of 500
        iconName: 'award',
        requirementType: 'workout_count',
        requirementValue: 5
      };

      expect(AchievementUtils.validateAchievement(invalidAchievement)).toBe(false);
    });
  });
});
