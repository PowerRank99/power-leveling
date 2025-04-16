
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XP_CONSTANTS } from '../../constants/xpConstants';

/**
 * Calculates Monge class-specific bonuses
 */
export class MongeBonus {
  /**
   * Apply Monge-specific bonuses to XP
   */
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    },
    streak: number = 0
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for bodyweight exercises - Força Interior
    const hasBodyweight = exerciseNames.some(name => 
      EXERCISE_TYPES.BODYWEIGHT.some(bw => name.includes(bw))
    );
    
    if (hasBodyweight) {
      const bodyweightBonus = Math.round(baseXP * 0.20);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.MONGE.PRIMARY,
        amount: bodyweightBonus,
        description: '+20% XP de exercícios com peso corporal'
      });
      bonusXP += bodyweightBonus;
    }
    
    // Additional streak bonus - Discípulo do Algoritmo
    if (streak > 0) {
      // Regular streak bonus is 5% per day (capped at 35% for 7 days)
      // Monge gets additional 10% of that bonus (capped at 3.5% extra)
      const regularStreakMultiplier = Math.min(streak, XP_CONSTANTS.MAX_STREAK_DAYS) * XP_CONSTANTS.STREAK_BONUS_PER_DAY;
      const additionalStreakBonus = Math.round(baseXP * regularStreakMultiplier * 0.10);
      
      if (additionalStreakBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.MONGE.SECONDARY,
          amount: additionalStreakBonus,
          description: '+10% no bônus de sequência'
        });
        bonusXP += additionalStreakBonus;
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
