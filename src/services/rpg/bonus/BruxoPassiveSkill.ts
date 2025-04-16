
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult, SpecialPassiveSkill } from '../types/PassiveSkillTypes';

/**
 * Implementation of Bruxo's primary ability: Fluxo Arcano
 * +40% XP from mobility & flexibility exercises
 */
export class FluxoArcano implements PassiveSkill {
  name = 'Fluxo Arcano';
  description = '+40% XP de exercícios de mobilidade e flexibilidade';
  userClass = 'Bruxo';
  
  // Bonus percentage for flexibility exercises
  private readonly FLEXIBILITY_BONUS = 0.4; // 40%
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Bruxo
    if (context.userClass !== this.userClass) return false;
    
    // Check if workout has flexibility exercises
    return (context.exerciseTypes['Mobilidade & Flexibilidade'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Calculate ratio of flexibility exercises
    const flexibilityCount = context.exerciseTypes['Mobilidade & Flexibilidade'] || 0;
    const flexibilityRatio = flexibilityCount / context.totalExercises;
    
    // Calculate bonus XP
    const bonusXP = Math.round(context.baseXP * this.FLEXIBILITY_BONUS * flexibilityRatio);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: this.FLEXIBILITY_BONUS
    };
  }
}

/**
 * Implementation of Bruxo's secondary ability: Pijama Arcano
 * When Bruxo doesn't train, streak bonus only reduced by 5% (instead of resetting)
 */
export class PijamaArcano implements SpecialPassiveSkill {
  name = 'Pijama Arcano';
  description = 'Ao falhar um dia, a sequência é reduzida em apenas 5% ao invés de zerar';
  userClass = 'Bruxo';
  
  // Streak reduction percentage
  private readonly STREAK_REDUCTION = 0.05; // 5%
  
  // Cooldown period in days
  private readonly COOLDOWN_DAYS = 7;
  
  isApplicable(context: PassiveSkillContext): boolean {
    // This is a special passive skill that doesn't directly apply to workouts
    // It's triggered when checking streak preservation
    return context.userClass === this.userClass;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // This ability doesn't provide direct XP bonuses
    // It preserves streak which indirectly affects XP
    return {
      bonusXP: 0,
      description: this.description,
      skillName: this.name
    };
  }
  
  /**
   * Check if Bruxo should preserve streak using the database
   */
  async canTrigger(userId: string, context: any): Promise<boolean> {
    try {
      // Check if user is Bruxo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) return false;
      
      // Must be Bruxo to use this ability
      if (profile.class !== this.userClass) return false;
      
      // Check if ability is on cooldown (can only use once per week)
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', this.name)
        .gte('used_at', new Date(Date.now() - (this.COOLDOWN_DAYS * 24 * 60 * 60 * 1000)).toISOString())
        .maybeSingle();
      
      if (error) {
        console.error('Error checking Bruxo streak preservation:', error);
        return false;
      }
      
      // Can trigger if not on cooldown
      return !data;
    } catch (error) {
      console.error('Error checking Bruxo streak preservation:', error);
      return false;
    }
  }
  
  /**
   * Execute ability - record usage and preserve streak with reduction
   */
  async execute(userId: string, context: any): Promise<boolean> {
    try {
      // Get current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error getting user streak:', profileError);
        return false;
      }
      
      // Calculate reduced streak (lose 5% rounded down)
      const oldStreak = profile.streak || 0;
      const reduction = Math.floor(oldStreak * this.STREAK_REDUCTION);
      const newStreak = Math.max(1, oldStreak - reduction); // Minimum streak of 1
      
      // Update streak with reduction
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating reduced streak:', updateError);
        return false;
      }
      
      // Record passive skill usage
      const { error: insertError } = await supabase
        .from('passive_skill_usage')
        .insert({
          user_id: userId,
          skill_name: this.name,
          used_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error recording passive skill usage:', insertError);
        return false;
      }
          
      toast.success('Pijama Arcano Ativado!', {
        description: `Seu Bruxo perdeu apenas ${reduction} dias de sequência ao invés de perder tudo!`
      });
      
      return true;
    } catch (error) {
      console.error('Error executing Bruxo streak preservation:', error);
      return false;
    }
  }
}

/**
 * Implementation of Bruxo's Topo da Montanha ability
 * When completing an achievement, receives 50% more achievement points
 */
export class TopoDaMontanha implements SpecialPassiveSkill {
  name = 'Topo da Montanha';
  description = 'Recebe 50% mais pontos de conquista';
  userClass = 'Bruxo';
  
  // Bonus percentage for achievement points
  private readonly ACHIEVEMENT_BONUS = 0.5; // 50%
  
  isApplicable(context: PassiveSkillContext): boolean {
    // This is a special passive skill that applies to achievement completions
    return context.userClass === this.userClass;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // This skill doesn't provide direct XP bonuses
    // It increases achievement points
    return {
      bonusXP: 0,
      description: this.description,
      skillName: this.name,
      multiplier: this.ACHIEVEMENT_BONUS
    };
  }
  
  /**
   * Check if this ability can be triggered for achievement point bonus
   */
  async canTrigger(userId: string, context: any): Promise<boolean> {
    try {
      // Check if user is Bruxo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) return false;
      
      // Must be Bruxo to use this ability
      return profile.class === this.userClass;
    } catch (error) {
      console.error('Error checking Bruxo achievement bonus eligibility:', error);
      return false;
    }
  }
  
  /**
   * Execute ability - apply achievement point bonus
   * This is called when processing achievement completion
   */
  async execute(userId: string, context: { points: number }): Promise<boolean> {
    try {
      // Calculate bonus points (50% more)
      const bonusPoints = Math.floor(context.points * this.ACHIEVEMENT_BONUS);
      
      // Update user's achievement points with bonus
      const { error } = await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'achievement_points', 
        increment_amount: bonusPoints
      });
      
      if (error) {
        console.error('Error applying Bruxo achievement point bonus:', error);
        return false;
      }
      
      // Show toast notification
      toast.success('Topo da Montanha Ativado!', {
        description: `Seu Bruxo recebeu +${bonusPoints} pontos de conquista bônus!`
      });
      
      return true;
    } catch (error) {
      console.error('Error executing Bruxo achievement bonus:', error);
      return false;
    }
  }
}
