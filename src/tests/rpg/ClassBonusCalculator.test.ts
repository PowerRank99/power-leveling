
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassBonusCalculator } from '@/services/rpg/calculations/ClassBonusCalculator';
import { ExerciseTypeClassifier } from '@/services/rpg/calculations/ExerciseTypeClassifier';

// Mock the ExerciseTypeClassifier
vi.mock('@/services/rpg/calculations/ExerciseTypeClassifier', () => ({
  ExerciseTypeClassifier: {
    isGuerreiroExercise: vi.fn(),
    isMongeExercise: vi.fn(),
    isNinjaExercise: vi.fn(),
    isDruidaExercise: vi.fn(),
    isPaladinoExercise: vi.fn(),
    countQualifyingExercises: vi.fn(),
    countQualifyingSets: vi.fn()
  }
}));

describe('ClassBonusCalculator', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });
  
  describe('applyClassBonuses', () => {
    it('should return base XP without bonuses when no class is provided', () => {
      const components = {
        timeXP: 40,
        exerciseXP: 10,
        setsXP: 6,
        prBonus: 0,
        totalBaseXP: 56
      };
      
      const workout = {
        id: 'test-workout',
        exercises: [],
        durationSeconds: 1800
      };
      
      const result = ClassBonusCalculator.applyClassBonuses(components, workout, null);
      
      expect(result.totalXP).toBe(56);
      expect(result.bonusBreakdown).toEqual([]);
    });
    
    it('should apply Guerreiro bonuses for strength exercises', () => {
      const components = {
        timeXP: 40,
        exerciseXP: 15,
        setsXP: 10,
        prBonus: 50,
        totalBaseXP: 115
      };
      
      const workout = {
        id: 'test-workout',
        exercises: [{ id: 'ex1' }],
        durationSeconds: 1800,
        hasPR: true
      };
      
      // Mock the classifier to return qualifying exercises and sets
      vi.mocked(ExerciseTypeClassifier.countQualifyingExercises).mockReturnValue(3);
      vi.mocked(ExerciseTypeClassifier.countQualifyingSets).mockReturnValue(6);
      
      const result = ClassBonusCalculator.applyClassBonuses(
        components, 
        workout, 
        'Guerreiro', 
        0, 
        'user-123'
      );
      
      // Check that bonuses were applied correctly
      expect(result.totalXP).toBeGreaterThan(components.totalBaseXP);
      
      // Check for Força Bruta bonus (20% of qualifying exercise/set XP)
      const forcaBrutaBonus = result.bonusBreakdown.find(b => 
        b.skill === 'Força Bruta'
      );
      expect(forcaBrutaBonus).toBeDefined();
      
      // Check for PR bonus (Saindo da Jaula)
      const prBonus = result.bonusBreakdown.find(b => 
        b.skill === 'Saindo da Jaula'
      );
      expect(prBonus).toBeDefined();
    });
    
    it('should apply Ninja bonuses for cardio exercises and short workouts', () => {
      const components = {
        timeXP: 35,
        exerciseXP: 10,
        setsXP: 4,
        prBonus: 0,
        totalBaseXP: 49
      };
      
      const workout = {
        id: 'test-workout',
        exercises: [{ id: 'ex1' }],
        durationSeconds: 2100 // 35 minutes (under 45 minute threshold)
      };
      
      // Mock the classifier to return qualifying exercises and sets
      vi.mocked(ExerciseTypeClassifier.countQualifyingExercises).mockReturnValue(2);
      vi.mocked(ExerciseTypeClassifier.countQualifyingSets).mockReturnValue(2);
      
      const result = ClassBonusCalculator.applyClassBonuses(
        components, 
        workout, 
        'Ninja', 
        0, 
        'user-123'
      );
      
      // Check that bonuses were applied correctly
      expect(result.totalXP).toBeGreaterThan(components.totalBaseXP);
      
      // Check for Forrest Gump bonus (20% of qualifying exercise/set XP)
      const forrestGumpBonus = result.bonusBreakdown.find(b => 
        b.skill === 'Forrest Gump'
      );
      expect(forrestGumpBonus).toBeDefined();
      
      // Check for HIIT & Run bonus (40% of time XP for short workouts)
      const hiitBonus = result.bonusBreakdown.find(b => 
        b.skill === 'HIIT & Run'
      );
      expect(hiitBonus).toBeDefined();
      expect(hiitBonus?.amount).toBe(Math.round(components.timeXP * 0.4));
    });
  });
  
  describe('Paladino guild bonuses', () => {
    it('should return base multiplier for non-Paladino users', () => {
      const bonus = ClassBonusCalculator.getPaladinoGuildBonus('user-123', 'Guerreiro', 5000);
      expect(bonus).toBe(1.0);
    });
    
    it('should return increased multiplier for Paladino users based on contribution', () => {
      // Low contribution
      let bonus = ClassBonusCalculator.getPaladinoGuildBonus('user-123', 'Paladino', 500);
      expect(bonus).toBe(1.1);
      
      // Medium contribution
      bonus = ClassBonusCalculator.getPaladinoGuildBonus('user-123', 'Paladino', 1500);
      expect(bonus).toBe(1.2);
      
      // High contribution
      bonus = ClassBonusCalculator.getPaladinoGuildBonus('user-123', 'Paladino', 3000);
      expect(bonus).toBe(1.3);
    });
  });
});
