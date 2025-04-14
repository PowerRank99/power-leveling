
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculates Bruxo class-specific bonuses
 */
export class BruxoBonus {
  // One week in milliseconds for cooldown checks
  private static readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Apply Bruxo-specific bonuses to XP
   */
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    }
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Add Pijama Arcano to breakdown for display purposes
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.BRUXO.PRIMARY,
      amount: 0,
      description: 'Sequência reduz apenas 5% por dia sem treinar'
    });
    
    // Add Topo da Montanha to breakdown for display purposes
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.BRUXO.SECONDARY,
      amount: 0,
      description: '+50% pontos de conquistas ao completar'
    });
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo has completed an achievement recently and should get bonus points
   */
  static async shouldApplyAchievementBonus(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // Check if Topo da Montanha has been used in the past week
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Topo da Montanha')
        .gte('used_at', new Date(Date.now() - this.ONE_WEEK_MS).toISOString())
        .maybeSingle();
      
      // If there's no data and no error, the player hasn't used it recently
      return !data && !error;
    } catch (error) {
      console.error('Error checking Bruxo achievement bonus:', error);
      return false;
    }
  }
  
  /**
   * Get streak reduction factor for Bruxo (Pijama Arcano)
   * Bruxo's streak reduces by 5% each day instead of resetting
   */
  static getStreakReductionFactor(daysMissed: number): number {
    // Calculate the reduction (5% per day)
    const reduction = Math.min(1.0, daysMissed * 0.05);
    
    // Return the factor to multiply by streak (e.g., 0.95, 0.90, etc.)
    return Math.max(0, 1 - reduction);
  }
}
