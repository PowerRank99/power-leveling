
import { describe, it, expect } from 'vitest';
import { BaseXPCalculator } from '@/services/rpg/calculations/BaseXPCalculator';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';

describe('BaseXPCalculator Integration Tests', () => {
  describe('Extreme Duration Scenarios', () => {
    it('should handle very long workouts correctly', () => {
      const result = BaseXPCalculator.calculateTimeXP(180); // 3 hours
      expect(result).toBe(90); // Should cap at max XP
    });

    it('should handle fractional durations', () => {
      const result = BaseXPCalculator.calculateTimeXP(45.5);
      expect(result).toBeGreaterThan(40);
      expect(result).toBeLessThan(70);
    });
  });

  describe('Anti-abuse Mechanisms', () => {
    it('should cap XP from excessive sets', () => {
      const components = BaseXPCalculator.calculateXPComponents({
        exercises: Array(5).fill({
          id: 'ex1',
          exerciseId: 'str1',
          name: 'Test Exercise',
          sets: Array(10).fill({
            id: 'set1',
            weight: '100',
            reps: '10',
            completed: true
          })
        }),
        durationSeconds: 3600
      });

      const maxSetXP = XP_CONSTANTS.MAX_XP_CONTRIBUTING_SETS * XP_CONSTANTS.BASE_SET_XP;
      expect(components.setsXP).toBeLessThanOrEqual(maxSetXP);
    });
  });
});
