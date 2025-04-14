
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClassBonusCalculator } from '@/services/rpg/calculations/ClassBonusCalculator';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';

describe('ClassBonusCalculator Integration Tests', () => {
  const mockWorkout = {
    id: 'test-workout',
    exercises: [
      {
        id: 'ex1',
        exerciseId: 'str1',
        name: 'Bench Press',
        type: 'Musculação',
        sets: [
          { id: 'set1', weight: '100', reps: '10', completed: true }
        ]
      }
    ],
    durationSeconds: 1800
  };

  describe('Class Interactions', () => {
    it('should stack multiple class bonuses correctly', () => {
      const components = {
        timeXP: 40,
        exerciseXP: 5,
        setsXP: 2,
        prBonus: 50,
        totalBaseXP: 97
      };

      const result = ClassBonusCalculator.applyClassBonuses(
        components,
        mockWorkout,
        'Guerreiro',
        7
      );

      expect(result.bonusBreakdown).toHaveLength(1);
      expect(result.totalXP).toBeGreaterThan(components.totalBaseXP);
    });

    it('should respect XP cap even with multiple bonuses', () => {
      const components = {
        timeXP: 90,
        exerciseXP: 50,
        setsXP: 20,
        prBonus: 50,
        totalBaseXP: 210
      };

      const result = ClassBonusCalculator.applyClassBonuses(
        components,
        mockWorkout,
        'Guerreiro',
        7
      );

      expect(result.totalXP).toBeLessThanOrEqual(XP_CONSTANTS.DAILY_XP_CAP);
    });
  });
});
