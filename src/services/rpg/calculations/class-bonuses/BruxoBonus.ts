
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Bruxo class bonus calculator
 * - Fluxo Arcano: +40% XP from mobility & flexibility exercises
 * - Folga Mística: When Bruxo doesn't train, streak bonus reduced by only 5% (instead of resetting)
 */
export class BruxoBonus {
  // Bonus percentages
  private static readonly FLEXIBILITY_BONUS = 0.4; // 40%
  private static readonly STREAK_REDUCTION = 0.05; // 5%
  
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
    
    // Fluxo Arcano: +40% XP from mobility & flexibility exercises
    const flexibilityExercises = workout.exercises.filter(
      ex => ex.type === 'Mobilidade & Flexibilidade'
    );
    
    if (flexibilityExercises.length > 0) {
      // Calculate percentage of flexibility exercises
      const flexibilityRatio = flexibilityExercises.length / workout.exercises.length;
      const flexibilityBonus = Math.round(baseXP * this.FLEXIBILITY_BONUS * flexibilityRatio);
      
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
}
