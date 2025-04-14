import { describe, it, expect } from 'vitest';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';
import { WorkoutExercise } from '@/types/workoutTypes';

describe('XPCalculationService', () => {
  describe('getStreakMultiplier', () => {
    it('should return 1.0 for streak of 0', () => {
      expect(XPCalculationService.getStreakMultiplier(0)).toBe(1.0);
    });

    it('should return correct multiplier for various streak values', () => {
      expect(XPCalculationService.getStreakMultiplier(1)).toBe(1.05);
      expect(XPCalculationService.getStreakMultiplier(3)).toBe(1.15);
      expect(XPCalculationService.getStreakMultiplier(7)).toBe(1.35);
    });

    it('should cap the multiplier at the maximum streak days', () => {
      const maxDays = XP_CONSTANTS.MAX_STREAK_DAYS;
      const expected = 1 + (maxDays * XP_CONSTANTS.STREAK_BONUS_PER_DAY);
      
      // Test with a value higher than the maximum
      expect(XPCalculationService.getStreakMultiplier(maxDays + 5)).toBe(expected);
    });
  });

  describe('calculateTimeXP', () => {
    it('should return 0 XP for 0 minutes', () => {
      expect(XPCalculationService.calculateTimeXP(0)).toBe(0);
    });
    
    it('should return correct XP for minutes within the first tier', () => {
      // First tier: 0-30 minutes, 40 XP total
      expect(XPCalculationService.calculateTimeXP(15)).toBe(20); // Half of first tier
      expect(XPCalculationService.calculateTimeXP(30)).toBe(40); // Full first tier
    });
    
    it('should return correct XP for minutes spanning multiple tiers', () => {
      // First tier: 0-30 minutes, 40 XP
      // Second tier: 30-60 minutes, +30 XP (70 total)
      expect(XPCalculationService.calculateTimeXP(45)).toBe(55); // 40 + (15/30 * 30)
      
      // Complete first and second tiers
      expect(XPCalculationService.calculateTimeXP(60)).toBe(70);
      
      // Add some from third tier (60-90 minutes, +20 XP)
      expect(XPCalculationService.calculateTimeXP(75)).toBe(80); // 70 + (15/30 * 20)
      
      // Complete all three tiers
      expect(XPCalculationService.calculateTimeXP(90)).toBe(90);
    });
    
    it('should cap XP at the maximum duration', () => {
      // Beyond 90 minutes should still return 90 XP
      expect(XPCalculationService.calculateTimeXP(120)).toBe(90);
    });
  });

  describe('calculateWorkoutXP', () => {
    it('should calculate base XP correctly for a simple workout', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [
            {
              id: 'ex1',
              exerciseId: 'strength-1',
              name: 'Bench Press',
              sets: [
                { id: 'set1', weight: '50', reps: '10', completed: true },
                { id: 'set2', weight: '50', reps: '10', completed: true },
                { id: 'set3', weight: '50', reps: '10', completed: true }
              ]
            },
            {
              id: 'ex2',
              exerciseId: 'strength-2',
              name: 'Squat',
              sets: [
                { id: 'set4', weight: '70', reps: '8', completed: true },
                { id: 'set5', weight: '70', reps: '8', completed: true },
                { id: 'set6', weight: '70', reps: '8', completed: true }
              ]
            }
          ],
          durationSeconds: 1800 // 30 minutes
        }
      });
      
      // 40 XP for 30 minutes + 10 XP for 2 exercises + 12 XP for 6 sets = 62 base XP
      expect(result.baseXP).toBe(62);
      expect(result.totalXP).toBe(62);
    });
    
    it('should apply streak multiplier correctly', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [
            {
              id: 'ex1',
              exerciseId: 'strength-1',
              name: 'Bench Press',
              sets: [
                { id: 'set1', weight: '50', reps: '10', completed: true },
                { id: 'set2', weight: '50', reps: '10', completed: true }
              ]
            }
          ],
          durationSeconds: 1800 // 30 minutes
        },
        streak: 5 // 5 day streak
      });
      
      // Base XP: 40 (time) + 5 (1 exercise) + 4 (2 sets) = 49
      // Streak multiplier: 1.25 (5 days * 5%)
      // Expected XP: 49 + (49 * 0.25) = 49 + 12.25 = 61.25 rounded to 61
      expect(result.baseXP).toBe(49);
      expect(result.totalXP).toBe(61);
      
      // Verify streak bonus in breakdown
      const streakBonus = result.bonusBreakdown.find(b => b.skill === 'Streak');
      expect(streakBonus).toBeDefined();
      expect(streakBonus?.amount).toBe(12);
    });
    
    it('should apply personal record bonus if hasPR is true', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: [
            {
              id: 'ex1',
              exerciseId: 'strength-1',
              name: 'Bench Press',
              sets: [
                { id: 'set1', weight: '50', reps: '10', completed: true }
              ]
            }
          ],
          durationSeconds: 1200, // 20 minutes
          hasPR: true
        }
      });
      
      // Base XP: ~27 (time) + 5 (1 exercise) + 2 (1 set) = ~34
      // PR Bonus: 50
      // Expected XP: ~84
      expect(result.baseXP).toBeGreaterThan(80);
      expect(result.components?.prBonus).toBe(50);
    });
    
    it('should cap XP at daily maximum', () => {
      const result = XPCalculationService.calculateWorkoutXP({
        workout: {
          id: 'test-workout',
          exercises: Array(20).fill(0).map((_, i) => ({
            id: `ex${i}`,
            exerciseId: `ex-id-${i}`,
            name: `Exercise ${i}`,
            sets: Array(10).fill(0).map((_, j) => ({
              id: `set-${i}-${j}`,
              weight: '50',
              reps: '10',
              completed: true
            }))
          })),
          durationSeconds: 7200, // 2 hours
          hasPR: true
        },
        streak: 7 // Maximum streak
      });
      
      // This should exceed the daily cap of 300 XP, so it should be capped
      expect(result.totalXP).toBe(XP_CONSTANTS.DAILY_XP_CAP);
    });
  });

  it('should handle edge cases in XP calculation', () => {
    // Test with minimal workout data
    const minimalWorkout = {
      id: 'minimal-workout',
      exercises: [],
      durationSeconds: 0,
      hasPR: false
    };

    const minimalResult = XPCalculationService.calculateWorkoutXP({ workout: minimalWorkout });
    expect(minimalResult.totalXP).toBe(50); // Default XP on error

    // Test with extremely long workout
    const longWorkout = {
      id: 'long-workout',
      exercises: Array(50).fill({
        id: 'exercise',
        exerciseId: 'ex1',
        name: 'Test Exercise',
        sets: [{ completed: true, weight: 50, reps: 10 }]
      }),
      durationSeconds: 7200, // 2 hours
      hasPR: true
    };

    const longWorkoutResult = XPCalculationService.calculateWorkoutXP({ 
      workout: longWorkout,
      streak: 7
    });

    expect(longWorkoutResult.totalXP).toBe(XP_CONSTANTS.DAILY_XP_CAP);
  });
});
