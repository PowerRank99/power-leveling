import { PassiveSkill, PassiveSkillContext, PassiveSkillResult } from '../types/PassiveSkillTypes';
import { XPCalculationService } from '../XPCalculationService';

/**
 * Força Interior: +20% XP from calisthenics exercises
 * Monge's primary ability
 */
export class ForcaInterior implements PassiveSkill {
  name = 'Força Interior';
  description = '+20% XP de exercícios de calistenia';
  userClass = 'Monge';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Monge and has calisthenics exercises
    if (context.userClass !== this.userClass) return false;
    
    // Check if there are calisthenics exercises
    return (context.exerciseTypes['Calistenia'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Count calisthenics exercises and sets only
    const calisthenicsCount = context.exerciseTypes['Calistenia'] || 0;
    
    // Calculate XP only for calisthenics exercises and their sets
    const calisthenicsBaseXP = calisthenicsCount * XPCalculationService.BASE_EXERCISE_XP;
    const calisthenicsSetsXP = (context.setCount * (calisthenicsCount / context.totalExercises)) * XPCalculationService.BASE_SET_XP;
    
    // Apply 20% bonus only to calisthenics portion
    const bonusMultiplier = 0.2;
    const bonusXP = Math.round((calisthenicsBaseXP + calisthenicsSetsXP) * bonusMultiplier);
    
    console.log(`[ForcaInterior] Calisthenics exercises: ${calisthenicsCount}, Base XP: ${calisthenicsBaseXP}, Sets XP: ${calisthenicsSetsXP}, Bonus: ${bonusXP}`);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}

/**
 * Discípulo do Algoritmo: +10% additional streak bonus
 * Monge's secondary ability
 */
export class DiscipuloDoAlgoritmo implements PassiveSkill {
  name = 'Discípulo do Algoritmo';
  description = '+10% XP por manter sequência de treinos';
  userClass = 'Monge';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Monge and has a streak > 1
    return context.userClass === this.userClass && context.streak > 1;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Apply 10% additional bonus
    const bonusMultiplier = 0.1;
    const bonusXP = Math.round(context.baseXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}
