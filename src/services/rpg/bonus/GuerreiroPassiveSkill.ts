
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult } from '../types/PassiveSkillTypes';
import { XPCalculationService } from '../XPCalculationService';

/**
 * Força Bruta: +20% XP from weight training exercises
 * Guerreiro's primary ability
 */
export class ForcaBruta implements PassiveSkill {
  name = 'Força Bruta';
  description = '+20% XP de exercícios de musculação';
  userClass = 'Guerreiro';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Guerreiro and has weight training exercises
    if (context.userClass !== this.userClass) return false;
    
    // Check if there are weight training exercises
    return (context.exerciseTypes['Musculação'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Apply 20% bonus directly to exercise and set XP
    const weightTrainingCount = context.exerciseTypes['Musculação'] || 0;
    
    // Only apply to the exercise and set portion of XP
    const exerciseXP = context.exerciseCount * XPCalculationService.BASE_EXERCISE_XP;
    const setXP = context.setCount * XPCalculationService.BASE_SET_XP;
    const exerciseAndSetXP = exerciseXP + setXP;
    
    const bonusMultiplier = 0.2; // Flat 20% bonus
    const bonusXP = Math.round(exerciseAndSetXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}

/**
 * Saindo da Jaula: +10% XP for workouts with Personal Records
 * Guerreiro's secondary ability
 */
export class SaindoDaJaula implements PassiveSkill {
  name = 'Saindo da Jaula';
  description = '+10% XP por bater recorde pessoal';
  userClass = 'Guerreiro';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Only applicable if user is Guerreiro and has a PR
    return context.userClass === this.userClass && context.hasPR;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Apply 10% bonus for having a PR
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
