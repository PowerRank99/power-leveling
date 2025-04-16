
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult } from '../types/PassiveSkillTypes';
import { XPCalculationService } from '../XPCalculationService';

/**
 * Forrest Gump: +20% XP from cardio exercises
 * Ninja's primary ability
 */
export class ForrestGump implements PassiveSkill {
  name = 'Forrest Gump';
  description = '+20% XP de exercícios de cardio';
  userClass = 'Ninja';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Ninja and has cardio exercises
    if (context.userClass !== this.userClass) return false;
    
    // Check if there are cardio exercises
    return (context.exerciseTypes['Cardio'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Calculate the cardio exercises
    const cardioCount = context.exerciseTypes['Cardio'] || 0;
    
    // Only apply to the exercise and set portion of XP
    const exerciseXP = context.exerciseCount * XPCalculationService.BASE_EXERCISE_XP;
    const setXP = context.setCount * XPCalculationService.BASE_SET_XP;
    const exerciseAndSetXP = exerciseXP + setXP;
    
    // Apply 20% bonus flat, not scaled by ratio
    const bonusMultiplier = 0.2;
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
 * HIIT & Run: +40% XP bonus from time in workouts under 45 minutes
 * Ninja's secondary ability
 */
export class HIITAndRun implements PassiveSkill {
  name = 'HIIT & Run';
  description = '+40% XP por treino rápido (<45min)';
  userClass = 'Ninja';
  private readonly THRESHOLD_MINUTES = 45;
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Ninja and workout is less than 45 minutes
    return context.userClass === this.userClass && 
           context.durationMinutes < this.THRESHOLD_MINUTES;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Apply 40% bonus for short workouts - but only to the time-based XP portion
    const bonusMultiplier = 0.4;
    
    // Calculate time-based XP
    const timeXP = XPCalculationService.calculateTimeXP(context.durationMinutes);
    
    // Apply the bonus to time XP only
    const bonusXP = Math.round(timeXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}
