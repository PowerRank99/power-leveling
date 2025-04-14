
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';
import { XPComponents } from '../../types/xpTypes';

/**
 * Calculates Bruxo class-specific bonuses
 */
export class BruxoBonus {
  /**
   * Apply Bruxo-specific bonuses to XP
   */
  static applyBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    }
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Bruxo's bonuses are more passive and not exercise-type specific
    // Pijama Arcano allows for streak maintenance (handled separately)
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.BRUXO.PRIMARY,
      amount: 0,
      description: 'Redução de streak reduzida em dias sem treino'
    });
    
    // Topo da Montanha gives achievement point bonuses (handled separately)
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.BRUXO.SECONDARY,
      amount: 0,
      description: '+50% em pontos de conquistas'
    });
    
    return { bonusXP, bonusBreakdown };
  }

  /**
   * Calculate streak reduction factor for Bruxo's Pijama Arcano
   * @param daysMissed Number of days missed
   * @returns Reduction factor (0-1)
   */
  static getStreakReductionFactor(daysMissed: number): number {
    // Each day missed reduces the streak by 5%
    const reductionPercentage = Math.min(daysMissed * 0.05, 1.0);
    return 1 - reductionPercentage;
  }
  
  /**
   * Check if Bruxo should get achievement point bonus
   * @param userId User ID
   * @returns Whether to apply 50% bonus
   */
  static async shouldApplyAchievementBonus(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // Check if user has completed 100 workouts
      const { data, error } = await supabase
        .from('workouts')
        .select('count')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching workout count:', error);
        return false;
      }
      
      // Safely access the count from the returned data
      const workoutCount = data && data.length > 0 ? parseInt(data[0].count as unknown as string, 10) : 0;
      return workoutCount >= 100;
    } catch (error) {
      console.error('Error checking achievement bonus:', error);
      return false;
    }
  }
}
