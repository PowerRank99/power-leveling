
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
    
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for flexibility exercises - Fluxo Arcano
    const hasFlexibility = exerciseNames.some(name => 
      EXERCISE_TYPES.FLEXIBILITY.some(flex => name.includes(flex))
    );
    
    if (hasFlexibility) {
      const flexibilityBonus = Math.round(baseXP * 0.40);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.BRUXO.PRIMARY,
        amount: flexibilityBonus,
        description: '+40% XP de yoga e alongamentos'
      });
      bonusXP += flexibilityBonus;
    }
    
    // Streak preservation bonus is handled separately
    // But we add it to the breakdown for display purposes
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.BRUXO.SECONDARY,
      amount: 0,
      description: 'Preserva sequência se faltar um dia (semanal)'
    });
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo should preserve streak using the database
   */
  static async shouldPreserveStreak(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // Use regular query to check passive skill usage
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Folga Mística')
        .gte('used_at', new Date(Date.now() - this.ONE_WEEK_MS).toISOString())
        .maybeSingle();
      
      // If no data and no error, the skill hasn't been used recently
      return !data && !error;
    } catch (error) {
      console.error('Error checking Bruxo streak preservation:', error);
      return false;
    }
  }
}
