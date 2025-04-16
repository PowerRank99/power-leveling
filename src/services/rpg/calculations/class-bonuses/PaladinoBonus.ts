
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusCalculator } from '../ClassBonusCalculator';
import { ClassBonusBreakdown } from '../../types/classTypes';

/**
 * Paladino class bonus calculator
 * - Caminho do Herói: +40% XP from sport activities
 * - Camisa 10: +10% bonus to guild XP contribution (stackable with multiple Paladinos)
 */
export class PaladinoBonus {
  // Bonus percentages
  private static readonly SPORTS_BONUS = 0.4; // 40%
  private static readonly GUILD_CONTRIBUTION_BONUS = 0.1; // 10%
  private static readonly MAX_GUILD_BONUS = 0.3; // 30% (3 Paladinos)
  
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    }
  ): { 
    bonusXP: number;
    bonusBreakdown: ClassBonusBreakdown[];
  } {
    let bonusXP = 0;
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Caminho do Herói: +40% XP from sport activities
    const sportsExercises = workout.exercises.filter(
      ex => ex.type === 'Esportes'
    );
    
    if (sportsExercises.length > 0) {
      // Calculate percentage of sports exercises
      const sportsRatio = sportsExercises.length / workout.exercises.length;
      const sportsBonus = Math.round(baseXP * this.SPORTS_BONUS * sportsRatio);
      
      if (sportsBonus > 0) {
        bonusXP += sportsBonus;
        bonusBreakdown.push({
          skill: 'Caminho do Herói',
          amount: sportsBonus,
          description: `+${Math.round(this.SPORTS_BONUS * 100)}% XP de exercícios de esportes`
        });
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Calculate guild contribution bonus for Paladinos
   * Each Paladino adds 10% to guild contributions, up to 30% (3 Paladinos)
   */
  static getGuildBonus(contribution: number): number {
    return 1.0 + this.GUILD_CONTRIBUTION_BONUS;
  }
}
