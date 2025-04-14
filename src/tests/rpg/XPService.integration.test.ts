
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';
import { createMockSupabaseClient } from '../helpers/supabaseTestHelpers';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('XP Service Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('XP Calculation with Class Bonuses', () => {
    it('should apply Guerreiro bonus correctly for strength exercises', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [{
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Bench Press',
            type: 'Musculação',
            sets: Array(3).fill({
              id: 'set1',
              weight: '100',
              reps: '10',
              completed: true
            })
          }],
          durationSeconds: 1800,
          hasPR: false
        },
        userClass: 'Guerreiro',
        streak: 0
      });

      // Should have Guerreiro's 20% bonus for strength training
      const baseXP = result.components?.totalBaseXP || 0;
      const expectedBonus = Math.floor(baseXP * 0.2);
      const bonusAmount = result.bonusBreakdown.find(b => b.skill === 'Força Bruta')?.amount;
      
      expect(bonusAmount).toBe(expectedBonus);
    });

    it('should apply streak and class bonuses cumulatively', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [{
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Push-ups',
            type: 'Calistenia',
            sets: Array(3).fill({
              id: 'set1',
              weight: 'bodyweight',
              reps: '20',
              completed: true
            })
          }],
          durationSeconds: 1800,
          hasPR: false
        },
        userClass: 'Monge',
        streak: 7 // Maximum streak
      });

      // Should have both streak bonus (35%) and Monge bonus (20%)
      expect(result.bonusBreakdown).toHaveLength(2);
      expect(result.totalXP).toBeGreaterThan(result.baseXP);
    });
  });

  describe('Anti-gaming Mechanisms', () => {
    it('should respect daily XP cap even with multiple bonuses', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: Array(20).fill({
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Bench Press',
            type: 'Musculação',
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

      expect(result.totalXP).toBeLessThanOrEqual(XP_CONSTANTS.DAILY_XP_CAP);
    });

    it('should cap time-based XP for extremely long workouts', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [{
            id: 'ex1',
            exerciseId: 'str1',
            name: 'Running',
            type: 'Cardio',
            sets: [{ id: 'set1', weight: '0', reps: '1', completed: true }]
          }],
          durationSeconds: 14400, // 4 hours
          hasPR: false
        },
        userClass: 'Ninja'
      });

      // Should cap at 90 XP for time component
      expect(result.components?.timeXP).toBeLessThanOrEqual(90);
    });
  });
});
