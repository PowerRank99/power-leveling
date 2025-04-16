
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XP_CONSTANTS } from '../../constants/xpConstants';

/**
 * Calculates Ninja class-specific bonuses
 */
export class NinjaBonus {
  /**
   * Apply Ninja-specific bonuses to XP
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
    
    const workoutTimeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for cardio/HIIT - Forrest Gump
    const hasCardioHiit = exerciseNames.some(name => 
      EXERCISE_TYPES.CARDIO_HIIT.some(cardio => name.includes(cardio))
    );
    
    if (hasCardioHiit) {
      const cardioBonus = Math.round(baseXP * 0.20);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.NINJA.PRIMARY,
        amount: cardioBonus,
        description: '+20% XP de cardio'
      });
      bonusXP += cardioBonus;
    }
    
    // Short workout bonus - HIIT & Run
    if (workoutTimeMinutes < 45) {
      // Calculate time-based portion of XP
      const timeXP = this.estimateTimeBasedXP(workoutTimeMinutes);
      const timeBonus = Math.round(timeXP * 0.40);
      
      if (timeBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.NINJA.SECONDARY,
          amount: timeBonus,
          description: '+40% XP por tempo em treinos < 45 min'
        });
        bonusXP += timeBonus;
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Helper method to estimate time-based XP for Ninja class bonus
   */
  private static estimateTimeBasedXP(durationMinutes: number): number {
    let timeXP = 0;
    
    // Use similar logic to BaseXPCalculator but simplified
    for (const tier of XP_CONSTANTS.TIME_XP_TIERS) {
      if (durationMinutes <= 0) break;
      
      if (durationMinutes <= tier.minutes) {
        timeXP += tier.xp;
        break;
      }
    }
    
    return timeXP;
  }
}
