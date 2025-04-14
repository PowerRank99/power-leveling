
import { describe, it, expect } from 'vitest';
import { BaseXPCalculator } from '@/services/rpg/calculations/BaseXPCalculator';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';

describe('BaseXPCalculator', () => {
  describe('calculateXPComponents', () => {
    it('should calculate components correctly for a simple workout', () => {
      const components = BaseXPCalculator.calculateXPComponents({
        exercises: [
          {
            id: 'ex1',
            exerciseId: 'strength-1',
            name: 'Bench Press',
            sets: [
              { id: 'set1', weight: '50', reps: '10', completed: true },
              { id: 'set2', weight: '50', reps: '10', completed: true }
            ]
          },
          {
            id: 'ex2',
            exerciseId: 'strength-2',
            name: 'Squat',
            sets: [
              { id: 'set3', weight: '70', reps: '8', completed: true },
              { id: 'set4', weight: '70', reps: '8', completed: false } // Not completed
            ]
          }
        ],
        durationSeconds: 1800 // 30 minutes
      });
      
      // Time XP: 40 (for 30 minutes)
      // Exercise XP: 2 exercises * 5 XP = 10
      // Sets XP: 3 completed sets * 2 XP = 6
      // Total: 40 + 10 + 6 = 56
      expect(components.timeXP).toBe(40);
      expect(components.exerciseXP).toBe(10);
      expect(components.setsXP).toBe(6);
      expect(components.totalBaseXP).toBe(56);
    });
    
    it('should cap sets XP at the maximum allowed', () => {
      // Create a workout with many sets to test capping
      const exercises = Array(3).fill(0).map((_, i) => ({
        id: `ex${i}`,
        exerciseId: `ex-id-${i}`,
        name: `Exercise ${i}`,
        sets: Array(6).fill(0).map((_, j) => ({
          id: `set-${i}-${j}`,
          weight: '50',
          reps: '10',
          completed: true
        }))
      }));
      
      const components = BaseXPCalculator.calculateXPComponents({
        exercises,
        durationSeconds: 2700 // 45 minutes
      });
      
      // Time XP: 55 (for 45 minutes)
      // Exercise XP: 3 exercises * 5 XP = 15
      // Sets XP: Should be capped at MAX_XP_CONTRIBUTING_SETS (10) * 2 XP = 20
      //   (Even though there are 18 completed sets total)
      // Total: 55 + 15 + 20 = 90
      expect(components.timeXP).toBe(55);
      expect(components.exerciseXP).toBe(15);
      expect(components.setsXP).toBe(20); // Capped at 10 sets * 2 XP
      expect(components.totalBaseXP).toBe(90);
    });
    
    it('should handle workouts with no completed sets', () => {
      const components = BaseXPCalculator.calculateXPComponents({
        exercises: [
          {
            id: 'ex1',
            exerciseId: 'strength-1',
            name: 'Bench Press',
            sets: [
              { id: 'set1', weight: '50', reps: '10', completed: false },
              { id: 'set2', weight: '50', reps: '10', completed: false }
            ]
          }
        ],
        durationSeconds: 600 // 10 minutes
      });
      
      // Time XP: ~13 (for 10 minutes)
      // Exercise XP: 1 exercise * 5 XP = 5
      // Sets XP: 0 completed sets * 2 XP = 0
      // Total: ~13 + 5 + 0 = ~18
      expect(components.timeXP).toBeGreaterThan(10);
      expect(components.exerciseXP).toBe(5);
      expect(components.setsXP).toBe(0);
      expect(components.totalBaseXP).toBeGreaterThan(15);
    });
  });
});
