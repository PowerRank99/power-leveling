
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult, SpecialPassiveSkill } from '../types/PassiveSkillTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Caminho do Herói: +40% XP from sport activities
 * Paladino's primary ability
 */
export class CaminhoDoHeroi implements PassiveSkill {
  name = 'Caminho do Herói';
  description = '+40% XP de exercícios de esportes';
  userClass = 'Paladino';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Paladino and has sports exercises
    if (context.userClass !== this.userClass) return false;
    
    // Check if there are sports exercises
    return (context.exerciseTypes['Esportes'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Calculate the ratio of sports exercises to total exercises
    const sportsCount = context.exerciseTypes['Esportes'] || 0;
    const sportsRatio = sportsCount / context.totalExercises;
    
    // Apply 40% bonus scaled by the ratio of sports exercises
    const bonusMultiplier = 0.4 * sportsRatio;
    const bonusXP = Math.round(context.baseXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}

/**
 * Camisa 10: +10% bonus to guild XP contribution (stackable with multiple Paladinos)
 * Paladino's secondary ability that applies to guild contributions
 */
export class Camisa10 implements SpecialPassiveSkill {
  name = 'Camisa 10';
  description = '+10% de contribuição para Guilda';
  userClass = 'Paladino';
  private readonly CONTRIBUTION_BONUS = 0.1; // 10%
  private readonly MAX_BONUS = 0.3; // Max 30% from 3 Paladinos
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Always applicable for Paladinos (will be checked in guild contribution logic)
    return context.userClass === this.userClass;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // For display purposes - actual calculation happens in guild contribution
    return {
      bonusXP: 0, // This doesn't directly add XP to the workout
      description: this.description,
      skillName: this.name
    };
  }
  
  /**
   * Check if ability can be triggered
   * For Camisa 10, we always allow it to trigger
   */
  async canTrigger(userId: string, context: any): Promise<boolean> {
    return true;
  }
  
  /**
   * Execute the guild contribution bonus
   * @param userId User ID
   * @param context Guild contribution context
   * @returns Success status
   */
  async execute(userId: string, context: { guildId: string, baseContribution: number }): Promise<boolean> {
    try {
      // Get the number of Paladinos in the guild
      const { data: paladinos, error } = await supabase
        .from('guild_members')
        .select('profiles:user_id(class)')
        .eq('guild_id', context.guildId)
        .contains('profiles.class', 'Paladino');
      
      if (error) throw error;
      
      // Calculate bonus based on Paladino count (max 3)
      const paladinoCount = Math.min(paladinos?.length || 0, 3);
      const bonusMultiplier = paladinoCount * this.CONTRIBUTION_BONUS;
      
      // Apply bonus to the base contribution
      const bonusContribution = Math.round(context.baseContribution * bonusMultiplier);
      
      console.log(`Applied Camisa 10 bonus: ${bonusContribution} XP (${bonusMultiplier * 100}%)`);
      
      return true;
    } catch (error) {
      console.error('Error applying Camisa 10 bonus:', error);
      return false;
    }
  }
}
