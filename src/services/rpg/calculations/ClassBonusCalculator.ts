
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { XP_CONSTANTS } from '../constants/xpConstants';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for calculating class-specific XP bonuses
 */
export class ClassBonusCalculator {
  /**
   * Apply class-specific bonuses to XP
   */
  static applyClassBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      hasPR?: boolean;
    },
    userClass?: string | null,
    streak: number = 0
  ): { totalXP: number, bonusBreakdown: { skill: string, amount: number, description: string }[] } {
    if (!userClass) return { totalXP: baseXP, bonusBreakdown: [] };
    
    // Default bonus (applies to all classes)
    let totalXP = baseXP;
    const bonusBreakdown: { skill: string, amount: number, description: string }[] = [];
    
    const workoutTimeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Apply class-specific bonuses
    switch(userClass) {
      case 'Guerreiro':
        // Check for compound lifts - Força Bruta
        const hasCompoundLifts = exerciseNames.some(name => 
          EXERCISE_TYPES.COMPOUND_LIFTS.some(lift => name.includes(lift))
        );
        
        if (hasCompoundLifts) {
          const compoundBonus = Math.round(baseXP * 0.20);
          bonusBreakdown.push({
            skill: CLASS_PASSIVE_SKILLS.GUERREIRO.PRIMARY,
            amount: compoundBonus,
            description: '+20% XP de exercícios compostos'
          });
          totalXP += compoundBonus;
        }
        
        // PR bonus - Saindo da Jaula
        if (workout.hasPR) {
          const prBonus = Math.round(baseXP * 0.15);
          bonusBreakdown.push({
            skill: CLASS_PASSIVE_SKILLS.GUERREIRO.SECONDARY,
            amount: prBonus,
            description: '+15% XP por novo recorde pessoal'
          });
          totalXP += prBonus;
        }
        break;
        
      case 'Monge':
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
          totalXP += bodyweightBonus;
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
            totalXP += additionalStreakBonus;
          }
        }
        break;
        
      case 'Ninja':
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
          totalXP += cardioBonus;
        }
        
        // Short workout bonus - HIIT & Run
        if (workoutTimeMinutes < 45) {
          // Calculate time-based portion of XP (approximately 40-90 based on tiers)
          const timeXP = this.estimateTimeBasedXP(workoutTimeMinutes);
          const timeBonus = Math.round(timeXP * 0.40);
          
          if (timeBonus > 0) {
            bonusBreakdown.push({
              skill: CLASS_PASSIVE_SKILLS.NINJA.SECONDARY,
              amount: timeBonus,
              description: '+40% XP por tempo em treinos < 45 min'
            });
            totalXP += timeBonus;
          }
        }
        break;
        
      case 'Bruxo':
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
          totalXP += flexibilityBonus;
        }
        
        // Streak preservation bonus is handled separately in XPBonusService
        // But we add it to the breakdown for display purposes
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.BRUXO.SECONDARY,
          amount: 0,
          description: 'Preserva sequência se faltar um dia (semanal)'
        });
        break;
        
      case 'Paladino':
        // Check for sports activities - Caminho do Herói
        const hasSports = exerciseNames.some(name => 
          EXERCISE_TYPES.SPORTS.some(sport => name.includes(sport))
        );
        
        if (hasSports) {
          const sportsBonus = Math.round(baseXP * 0.40);
          bonusBreakdown.push({
            skill: CLASS_PASSIVE_SKILLS.PALADINO.PRIMARY,
            amount: sportsBonus,
            description: '+40% XP de atividades esportivas'
          });
          totalXP += sportsBonus;
        }
        
        // Guild XP contribution bonus - Camisa 10
        // This is handled in GuildService but we add to breakdown for display
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.PALADINO.SECONDARY,
          amount: 0,
          description: '+10% para contribuição de XP de guild (até 30%)'
        });
        break;
    }
    
    return { totalXP, bonusBreakdown };
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
  
  /**
   * Check if Bruxo should preserve streak using the database function
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    
    try {
      // Use RPC function to check passive skill usage
      const { data, error } = await supabase
        .rpc('check_passive_skill_usage', {
          p_user_id: userId,
          p_skill_name: 'Folga Mística',
          p_days: 7
        });
      
      // If no error and data is false, the skill hasn't been used recently
      return !error && data === false;
    } catch (error) {
      console.error('Error checking Bruxo streak preservation:', error);
      return false;
    }
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getPaladinoGuildBonus(userId: string, userClass: string | null, currentContribution: number): number {
    if (!userId || userClass !== 'Paladino') return 1.0;
    
    // Base bonus is 10%, can stack up to 3 times based on contribution level
    const stackLevel = Math.min(Math.floor(currentContribution / 1000), 3);
    return 1.0 + (stackLevel * 0.1);
  }
}
