
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';
import { XPCalculationService } from '../../XPCalculationService';

/**
 * Bruxo class bonus calculator
 * - Fluxo Arcano: +40% XP from mobility & flexibility exercises
 * - Pijama Arcano: When Bruxo doesn't train, streak is reduced by only 5 percentage points instead of resetting
 */
export class BruxoBonus {
  // Bonus percentages
  private static readonly FLEXIBILITY_BONUS = 0.4; // 40%
  private static readonly STREAK_REDUCTION_POINTS = 0.05; // 5 percentage points
  
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
    
    // Fluxo Arcano: +40% XP directly on exercise and set XP parts for flexibility exercises
    const flexibilityExercises = workout.exercises.filter(
      ex => ex.type === 'Mobilidade & Flexibilidade'
    );
    
    if (flexibilityExercises.length > 0) {
      // Calculate the exercise and set XP parts only
      const exerciseXP = workout.exercises.length * XPCalculationService.BASE_EXERCISE_XP;
      
      // Count completed sets
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      
      const setXP = completedSets * XPCalculationService.BASE_SET_XP;
      
      // Apply the flat 40% bonus to exercise and set XP
      const flexibilityBonus = Math.round((exerciseXP + setXP) * this.FLEXIBILITY_BONUS);
      
      if (flexibilityBonus > 0) {
        bonusXP += flexibilityBonus;
        bonusBreakdown.push({
          skill: 'Fluxo Arcano',
          amount: flexibilityBonus,
          description: `+${Math.round(this.FLEXIBILITY_BONUS * 100)}% XP de exercícios de mobilidade e flexibilidade`
        });
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo should preserve streak
   * This is an async method that checks the database
   */
  static async shouldPreserveStreak(userId: string): Promise<boolean> {
    try {
      // Check if user is Bruxo
      const { data, error } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
        
      if (error || !data) return false;
      
      return data.class === 'Bruxo';
    } catch (error) {
      console.error('Error checking Bruxo streak preservation:', error);
      return false;
    }
  }
  
  /**
   * Reduce streak by 5 percentage points instead of resetting
   * This corresponds to losing 1 day of streak instead of all days
   */
  static async reduceStreakByPoints(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();
        
      if (error || !data) return false;
      
      // Reduce streak by 1 (equivalent to 5 percentage points)
      const newStreak = Math.max(1, (data.streak || 1) - 1);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', userId);
        
      if (updateError) return false;
      
      return true;
    } catch (error) {
      console.error('Error reducing Bruxo streak:', error);
      return false;
    }
  }
}
