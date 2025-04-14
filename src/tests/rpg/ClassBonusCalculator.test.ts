
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassBonusCalculator } from '@/services/rpg/calculations/ClassBonusCalculator';
import { XP_CONSTANTS } from '@/services/rpg/constants/xpConstants';
import { XPComponents } from '@/services/rpg/types/xpTypes';

// Mock the class bonus calculators
vi.mock('@/services/rpg/calculations/class-bonuses/GuerreiroBonus', () => ({
  GuerreiroBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 20, 
      bonusBreakdown: [{ skill: 'Força Bruta', amount: 20, description: '+20% XP for strength exercises' }] 
    })
  }
}));

vi.mock('@/services/rpg/calculations/class-bonuses/MongeBonus', () => ({
  MongeBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 15, 
      bonusBreakdown: [{ skill: 'Força Interior', amount: 15, description: '+20% XP from calisthenics' }] 
    })
  }
}));

vi.mock('@/services/rpg/calculations/class-bonuses/NinjaBonus', () => ({
  NinjaBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 25, 
      bonusBreakdown: [{ skill: 'HIIT & Run', amount: 25, description: '+40% XP from quick workouts' }] 
    })
  }
}));

vi.mock('@/services/rpg/calculations/class-bonuses/BruxoBonus', () => ({
  BruxoBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 10, 
      bonusBreakdown: [{ skill: 'Pijama Arcano', amount: 10, description: 'Bruxo bonus' }] 
    }),
    getStreakReductionPercentage: vi.fn().mockReturnValue(25),
    shouldApplyAchievementBonus: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('@/services/rpg/calculations/class-bonuses/PaladinoBonus', () => ({
  PaladinoBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 30, 
      bonusBreakdown: [{ skill: 'Caminho do Herói', amount: 30, description: '+40% XP from sports' }] 
    }),
    getGuildBonus: vi.fn().mockReturnValue(1.2)
  }
}));

vi.mock('@/services/rpg/calculations/class-bonuses/DruidaBonus', () => ({
  DruidaBonus: {
    applyBonuses: vi.fn().mockReturnValue({ 
      bonusXP: 18, 
      bonusBreakdown: [{ skill: 'Ritmo da Natureza', amount: 18, description: '+40% XP from mobility exercises' }] 
    }),
    shouldApplyRestBonus: vi.fn().mockResolvedValue({
      applyBonus: true,
      multiplier: 1.5
    })
  }
}));

vi.mock('@/services/rpg/calculations/ExerciseTypeClassifier', () => ({
  ExerciseTypeClassifier: {
    isGuerreiroExercise: vi.fn().mockReturnValue(true),
    isMongeExercise: vi.fn().mockReturnValue(true),
    isNinjaExercise: vi.fn().mockReturnValue(true),
    isDruidaExercise: vi.fn().mockReturnValue(true),
    isPaladinoExercise: vi.fn().mockReturnValue(true)
  }
}));

describe('ClassBonusCalculator', () => {
  let mockComponents: XPComponents;
  let mockWorkout: any;
  
  beforeEach(() => {
    mockComponents = {
      timeXP: 40,
      exerciseXP: 10,
      setsXP: 6,
      prBonus: 0,
      totalBaseXP: 56
    };
    
    mockWorkout = {
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
      durationSeconds: 1800
    };
  });

  describe('applyClassBonuses', () => {
    it('should return unmodified XP when no class is provided', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        null
      );
      
      expect(totalXP).toBe(56);
      expect(bonusBreakdown).toEqual([]);
    });
    
    it('should apply Guerreiro bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Guerreiro'
      );
      
      expect(totalXP).toBe(56 + 20);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('Força Bruta');
    });
    
    it('should apply Monge bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Monge',
        3
      );
      
      expect(totalXP).toBe(56 + 15);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('Força Interior');
    });
    
    it('should apply Ninja bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Ninja'
      );
      
      expect(totalXP).toBe(56 + 25);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('HIIT & Run');
    });
    
    it('should apply Bruxo bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Bruxo'
      );
      
      expect(totalXP).toBe(56 + 10);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('Pijama Arcano');
    });
    
    it('should apply Paladino bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Paladino'
      );
      
      expect(totalXP).toBe(56 + 30);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('Caminho do Herói');
    });
    
    it('should apply Druida bonuses correctly', () => {
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        mockComponents,
        mockWorkout,
        'Druida',
        0,
        'test-user-id'
      );
      
      expect(totalXP).toBe(56 + 18);
      expect(bonusBreakdown).toHaveLength(1);
      expect(bonusBreakdown[0].skill).toBe('Ritmo da Natureza');
    });
  });

  describe('getStreakReductionPercentage', () => {
    it('should return 0 for non-Bruxo classes', () => {
      const result = ClassBonusCalculator.getStreakReductionPercentage(
        'test-user',
        'Guerreiro',
        35,
        1
      );
      
      expect(result).toBe(0);
    });
    
    it('should return correct percentage for Bruxo', () => {
      const result = ClassBonusCalculator.getStreakReductionPercentage(
        'test-user',
        'Bruxo',
        35,
        1
      );
      
      expect(result).toBe(25);
    });
  });
  
  describe('applyAchievementPointsBonus', () => {
    it('should not apply bonus for non-Bruxo classes', async () => {
      const result = await ClassBonusCalculator.applyAchievementPointsBonus(
        'test-user',
        'Guerreiro',
        10
      );
      
      expect(result).toBe(10);
    });
    
    it('should apply 50% bonus for Bruxo when eligible', async () => {
      const result = await ClassBonusCalculator.applyAchievementPointsBonus(
        'test-user',
        'Bruxo',
        10
      );
      
      expect(result).toBe(15); // 10 * 1.5 = 15
    });
  });
  
  describe('applyDruidaRestBonus', () => {
    it('should not apply bonus for non-Druida classes', async () => {
      const result = await ClassBonusCalculator.applyDruidaRestBonus(
        'test-user',
        'Guerreiro',
        100
      );
      
      expect(result).toBe(100);
    });
    
    it('should apply rest bonus for Druida when eligible', async () => {
      const result = await ClassBonusCalculator.applyDruidaRestBonus(
        'test-user',
        'Druida',
        100
      );
      
      expect(result).toBe(150); // 100 * 1.5 = 150
    });
  });
  
  describe('getPaladinoGuildBonus', () => {
    it('should return 1.0 for non-Paladino classes', () => {
      const result = ClassBonusCalculator.getPaladinoGuildBonus(
        'test-user',
        'Guerreiro',
        100
      );
      
      expect(result).toBe(1.0);
    });
    
    it('should return correct bonus for Paladino', () => {
      const result = ClassBonusCalculator.getPaladinoGuildBonus(
        'test-user',
        'Paladino',
        100
      );
      
      expect(result).toBe(1.2);
    });
  });
});
