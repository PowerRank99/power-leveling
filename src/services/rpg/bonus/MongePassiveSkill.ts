
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult } from '../types/PassiveSkillTypes';

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
    // Calculate the ratio of calisthenics exercises to total exercises
    const calisthenicsCount = context.exerciseTypes['Calistenia'] || 0;
    const calisthenicsRatio = calisthenicsCount / context.totalExercises;
    
    // Apply 20% bonus scaled by the ratio of calisthenics exercises
    const bonusMultiplier = 0.2 * calisthenicsRatio;
    const bonusXP = Math.round(context.baseXP * bonusMultiplier);
    
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
