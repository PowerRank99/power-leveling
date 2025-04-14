
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { supabase } from '@/integrations/supabase/client';
import { XPComponents } from '../../types/xpTypes';
import { ExerciseTypeClassifier } from '../ExerciseTypeClassifier';

/**
 * Calculates Druida class-specific bonuses
 */
export class DruidaBonus {
  /**
   * Apply Druida-specific bonuses to XP
   */
  static applyBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    },
    isQualifyingExercise: (exercise: WorkoutExercise) => boolean,
    userId?: string
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Calculate number of qualifying exercises (Flexibility & Mobility type)
    const qualifyingExercisesCount = ExerciseTypeClassifier.countQualifyingExercises(
      workout.exercises, 
      isQualifyingExercise
    );
    
    // Calculate completed sets from qualifying exercises
    const qualifyingSetsCount = ExerciseTypeClassifier.countQualifyingSets(
      workout.exercises,
      isQualifyingExercise
    );
    
    // Only apply bonus if there are qualifying exercises
    if (qualifyingExercisesCount > 0) {
      // Calculate exercise XP that qualifies for the bonus
      const qualifyingExerciseXP = qualifyingExercisesCount * 5; // 5 XP per exercise
      
      // Calculate sets XP that qualifies for the bonus (capped at MAX_XP_CONTRIBUTING_SETS)
      const cappedQualifyingSets = Math.min(qualifyingSetsCount, 10); // Cap at 10 sets
      const qualifyingSetsXP = cappedQualifyingSets * 2; // 2 XP per set
      
      // Calculate total qualifying XP
      const totalQualifyingXP = qualifyingExerciseXP + qualifyingSetsXP;
      
      // Apply 40% bonus to qualifying XP
      const mobilityBonus = Math.round(totalQualifyingXP * 0.40);
      
      if (mobilityBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.DRUIDA.PRIMARY,
          amount: mobilityBonus,
          description: '+40% XP de exercícios de mobilidade e flexibilidade'
        });
        bonusXP += mobilityBonus;
      }
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
   * Check if Druida should receive rest bonus (50% XP on next workout after any rest period)
   * @param userId The user's ID
   * @returns Object containing whether bonus applies and bonus multiplier
   */
  static async shouldApplyRestBonus(userId: string): Promise<{ 
    applyBonus: boolean; 
    multiplier: number; 
  }> {
    if (!userId) return { applyBonus: false, multiplier: 1.0 };
    
    try {
      // Check if user has an unused Cochilada Mística bonus ready to apply
      const { data: bonusData, error: bonusError } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Cochilada Mística')
        .eq('used', false)
        .single();
      
      if (!bonusError && bonusData) {
        // Mark the bonus as used
        await supabase
          .from('passive_skill_usage')
          .update({ used: true })
          .eq('id', bonusData.id);
        
        return { applyBonus: true, multiplier: 1.5 }; // 50% bonus
      }
      
      // If no bonus found, check if user has had any rest days
      // Get last workout timestamp
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('last_workout_at')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile.last_workout_at) {
        // First time user or error - no bonus
        return { applyBonus: false, multiplier: 1.0 };
      }
      
      const lastWorkout = new Date(profile.last_workout_at);
      const today = new Date();
      const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      // If there's any gap between workouts, create a new bonus for the next workout
      if (daysSinceLastWorkout >= 1) {
        // Record the bonus for future use
        await supabase
          .from('passive_skill_usage')
          .insert({
            user_id: userId,
            skill_name: 'Cochilada Mística',
            used: false,
            used_at: null
          });
        
        // Don't apply the bonus now - it will be applied on the next workout
        return { applyBonus: false, multiplier: 1.0 };
      }
      
      return { applyBonus: false, multiplier: 1.0 };
    } catch (error) {
      console.error('Error checking Druida rest bonus:', error);
      return { applyBonus: false, multiplier: 1.0 };
    }
  }
}
