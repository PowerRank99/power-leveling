
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { createMockSupabaseClient } from '../helpers/supabaseTestHelpers';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('XPCalculationService Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Power Day Scenarios', () => {
    it('should respect power day XP cap', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'power-day-test',
          exercises: Array(10).fill({
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Bench Press',
            sets: Array(5).fill({
              id: 'set1',
              weight: '100',
              reps: '10',
              completed: true
            })
          }),
          durationSeconds: 7200,
          hasPR: true
        },
        userClass: 'Guerreiro',
        streak: 7
      });

      expect(result.totalXP).toBeLessThanOrEqual(XPCalculationService.POWER_DAY_XP_CAP);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely short workouts', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'short-workout',
          exercises: [{
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Quick Set',
            sets: [{
              id: 'set1',
              weight: '10',
              reps: '5',
              completed: true
            }]
          }],
          durationSeconds: 60,
          hasPR: false
        }
      });

      expect(result.totalXP).toBeGreaterThan(0);
      expect(result.components?.timeXP).toBeLessThan(XPCalculationService.TIME_XP_TIERS[0].xp);
    });

    it('should handle workouts with no completed sets', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'no-sets',
          exercises: [{
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Failed Exercise',
            sets: [{
              id: 'set1',
              weight: '100',
              reps: '10',
              completed: false
            }]
          }],
          durationSeconds: 1800,
          hasPR: false
        }
      });

      expect(result.components?.setsXP).toBe(0);
      expect(result.totalXP).toBeGreaterThan(0); // Should still get time XP
    });
  });
});
