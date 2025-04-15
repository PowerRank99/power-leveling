import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

describe('Achievement Validation', () => {
  it('validates an achievement with a valid schema', () => {
    const achievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      category: 'workout',
      rank: 'E',
      points: 5,
      xpReward: 100,
      iconName: 'star',
      requirements: { type: 'count', value: 5 }
    };
    
    expect(AchievementUtils.validateAchievement(achievement)).toBe(true);
  });

  it('rejects an achievement with missing required fields', () => {
    const achievement = {
      id: 'test-achievement',
      // Missing name field
      description: 'This is a test achievement',
      category: 'workout',
      rank: 'E',
      points: 5,
      xpReward: 100
    };
    
    expect(AchievementUtils.validateAchievement(achievement)).toBe(false);
  });

  it('rejects an achievement with invalid field types', () => {
    const achievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      category: 'workout',
      rank: 'E',
      points: 'not-a-number', // Should be a number
      xpReward: 100
    };
    
    expect(AchievementUtils.validateAchievement(achievement)).toBe(false);
  });

  it('validates an achievement with additional optional fields', () => {
    const achievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      category: 'workout',
      rank: 'E',
      points: 5,
      xpReward: 100,
      iconName: 'star',
      requirements: { type: 'count', value: 5 },
      extraField: 'this is fine'
    };
    
    expect(AchievementUtils.validateAchievement(achievement)).toBe(true);
  });
});
