
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult, SpecialPassiveSkill } from '../types/PassiveSkillTypes';

/**
 * Implementation of Druida's primary ability: Ritmo da Natureza
 * +40% XP from mobility & flexibility exercises
 */
export class RitmoDaNatureza implements PassiveSkill {
  name = 'Ritmo da Natureza';
  description = '+40% XP de exercícios de mobilidade e flexibilidade';
  userClass = 'Druida';
  
  // Bonus percentage for flexibility exercises
  private readonly FLEXIBILITY_BONUS = 0.4; // 40%
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Druida
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
 * Implementation of Druida's secondary ability: Cochilada Mística
 * 50% XP bonus on next workout after resting
 */
export class CochiladaMistica implements SpecialPassiveSkill {
  name = 'Cochilada Mística';
  description = '+50% XP de bônus depois de descansar um dia';
  userClass = 'Druida';
  
  // Bonus percentage for rest day follow-up
  private readonly REST_DAY_BONUS = 0.5; // 50%
  
  // Cooldown for this ability (in days)
  private readonly COOLDOWN_DAYS = 3;
  
  isApplicable(context: PassiveSkillContext): boolean {
    // This skill applies only when processing XP for a workout after a rest day
    // The core eligibility is checked in canTrigger
    return context.userClass === this.userClass;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Calculate bonus XP (50% of base XP)
    const bonusXP = Math.round(context.baseXP * this.REST_DAY_BONUS);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: this.REST_DAY_BONUS
    };
  }
  
  /**
   * Check if this ability can be triggered
   * Requires:
   * 1. User is Druida
   * 2. User has rested at least one day since last workout
   * 3. User hasn't used this ability in the cooldown period
   */
  async canTrigger(userId: string, context: any): Promise<boolean> {
    try {
      // Get user profile to check last workout date
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('last_workout_at, class')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('Error checking Druida ability eligibility:', profileError);
        return false;
      }
      
      // Check if user is Druida
      if (profile.class !== this.userClass) {
        return false;
      }
      
      // If no previous workout, can't trigger
      if (!profile.last_workout_at) {
        return false;
      }
      
      const lastWorkoutDate = new Date(profile.last_workout_at);
      const now = new Date();
      
      // Calculate days since last workout
      const daysSinceLastWorkout = Math.floor(
        (now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Check if user has rested 1-2 days (not 0, not 3+)
      if (daysSinceLastWorkout < 1 || daysSinceLastWorkout > 2) {
        return false;
      }
      
      // Check if ability is on cooldown
      const { data: usageData, error: usageError } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', this.name)
        .gte('used_at', new Date(Date.now() - (this.COOLDOWN_DAYS * 24 * 60 * 60 * 1000)).toISOString())
        .maybeSingle();
      
      if (usageError) {
        console.error('Error checking passive skill usage:', usageError);
        return false;
      }
      
      // Can trigger if not on cooldown
      return !usageData;
    } catch (error) {
      console.error('Error in Druida canTrigger:', error);
      return false;
    }
  }
  
  /**
   * Execute the special ability
   * Records usage and shows notification to user
   */
  async execute(userId: string, context: any): Promise<boolean> {
    try {
      // Record the usage
      const { error: insertError } = await supabase
        .from('passive_skill_usage')
        .insert({
          user_id: userId,
          skill_name: this.name,
          used_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error recording Druida passive skill usage:', insertError);
        return false;
      }
      
      // Show notification to user
      toast.success('Cochilada Mística Ativada!', {
        description: 'Seu Druida descansou e agora ganha +50% de XP neste treino!'
      });
      
      return true;
    } catch (error) {
      console.error('Error executing Druida passive skill:', error);
      return false;
    }
  }
}
