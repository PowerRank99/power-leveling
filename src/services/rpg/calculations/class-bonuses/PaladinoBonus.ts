
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';

/**
 * Calculates Paladino class-specific bonuses
 */
export class PaladinoBonus {
  /**
   * Apply Paladino-specific bonuses to XP
   */
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    }
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for sports activities - Caminho do Herói
    const hasSports = exerciseNames.some(name => 
      EXERCISE_TYPES.SPORTS.some(sport => name.includes(sport))
    );
    
    if (hasSports) {
      const sportsBonus = Math.round(baseXP * 0.40);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.PALADINO.PRIMARY,
        amount: sportsBonus,
        description: '+40% XP de atividades esportivas'
      });
      bonusXP += sportsBonus;
    }
    
    // Guild XP contribution bonus - Camisa 10
    // This is handled separately but we add to breakdown for display
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.PALADINO.SECONDARY,
      amount: 0,
      description: '+10% para contribuição de XP de guild (até 30%)'
    });
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getGuildBonus(currentContribution: number): number {
    // Base bonus is 10%, can stack up to 3 times based on contribution level
    const stackLevel = Math.min(Math.floor(currentContribution / 1000), 3);
    return 1.0 + (stackLevel * 0.1);
  }
}
