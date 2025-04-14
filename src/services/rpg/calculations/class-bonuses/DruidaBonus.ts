
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculates Druida class-specific bonuses
 */
export class DruidaBonus {
  /**
   * Apply Druida-specific bonuses to XP
   */
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    },
    userId?: string
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for mobility/flexibility exercises - Ritmo da Natureza
    const hasMobility = exerciseNames.some(name => 
      EXERCISE_TYPES.MOBILITY.some(mobility => name.includes(mobility))
    );
    
    if (hasMobility) {
      const mobilityBonus = Math.round(baseXP * 0.40);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.DRUIDA.PRIMARY,
        amount: mobilityBonus,
        description: '+40% XP de exercícios de mobilidade e flexibilidade'
      });
      bonusXP += mobilityBonus;
    }
    
    // Check if user has skipped workout days - Cochilada Mística
    // This will be checked separately in passive skill service
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.DRUIDA.SECONDARY,
      amount: 0,
      description: 'Quando não treina, recebe +50% XP no próximo treino'
    });
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Check if Druida should receive rest bonus (50% XP on next workout after skipping)
   * @param userId The user's ID
   * @returns Object containing whether bonus applies and bonus multiplier
   */
  static async shouldApplyRestBonus(userId: string): Promise<{ 
    applyBonus: boolean; 
    multiplier: number; 
  }> {
    if (!userId) return { applyBonus: false, multiplier: 1.0 };
    
    try {
      // Check if user has Cochilada Mística passive record
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Cochilada Mística')
        .single();
      
      if (error || !data) {
        // No record found, check if user has skipped a workout day
        // Get last workout timestamp
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('last_workout_at')
          .eq('id', userId)
          .single();
        
        if (profileError || !profile.last_workout_at) {
          return { applyBonus: false, multiplier: 1.0 };
        }
        
        const lastWorkout = new Date(profile.last_workout_at);
        const today = new Date();
        const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
        
        // If user skipped exactly one day, apply bonus
        if (daysSinceLastWorkout >= 1) {
          // Record the usage
          await supabase
            .from('passive_skill_usage')
            .insert({
              user_id: userId,
              skill_name: 'Cochilada Mística',
              used_at: new Date().toISOString()
            });
          
          return { applyBonus: true, multiplier: 1.5 }; // 50% bonus
        }
      }
      
      // If there's an existing record, we need to clear it
      if (data) {
        await supabase
          .from('passive_skill_usage')
          .delete()
          .eq('id', data.id);
      }
      
      return { applyBonus: false, multiplier: 1.0 };
    } catch (error) {
      console.error('Error checking Druida rest bonus:', error);
      return { applyBonus: false, multiplier: 1.0 };
    }
  }
}
