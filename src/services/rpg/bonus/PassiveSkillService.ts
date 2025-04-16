
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getClassRegistry } from '../registry/ClassRegistry';
import { PassiveSkillContext } from '../types/PassiveSkillTypes';

/**
 * Service for handling class passive skills
 */
export class PassiveSkillService {
  // One week in milliseconds for cooldown checks
  private static readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Check if Bruxo's Folga Mística passive should preserve streak
   * This is now a more generalized method to check for streak preservation
   */
  static async checkStreakPreservation(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || !userClass) return false;
    
    try {
      // Get registry instance
      const registry = getClassRegistry();
      
      // Get class configuration
      const classConfig = registry.getClassConfig(userClass);
      if (!classConfig) return false;
      
      // Check if class has streak preservation ability
      // For now, only Bruxo has PijamaArcano
      const passiveSkills = registry.getClassPassiveSkills(userClass);
      
      for (const skill of passiveSkills) {
        // Check if this is a special skill that can preserve streak
        if (registry.isSpecialPassiveSkill(skill) && 
            (skill.name === 'Pijama Arcano' || skill.name === 'Folga Mística')) {
          // Check if skill can be triggered
          const canTrigger = await skill.canTrigger(userId, {});
          if (canTrigger) {
            // Execute the skill
            return await skill.execute(userId, {});
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking streak preservation:', error);
      return false;
    }
  }
  
  /**
   * Check for any available post-rest bonuses (like Druida's Cochilada Mística)
   */
  static async checkPostRestBonuses(
    userId: string, 
    userClass: string | null,
    context: PassiveSkillContext
  ): Promise<{
    hasBonuses: boolean;
    bonusMultiplier: number;
    bonusDescription: string;
  }> {
    if (!userId || !userClass) {
      return { hasBonuses: false, bonusMultiplier: 0, bonusDescription: '' };
    }
    
    try {
      // Get registry instance
      const registry = getClassRegistry();
      
      // Get class configuration
      const classConfig = registry.getClassConfig(userClass);
      if (!classConfig) {
        return { hasBonuses: false, bonusMultiplier: 0, bonusDescription: '' };
      }
      
      // Check if class has post-rest bonus
      // For now, only Druida has CochiladaMistica
      const passiveSkills = registry.getClassPassiveSkills(userClass);
      
      for (const skill of passiveSkills) {
        // Check if this is a special skill that provides post-rest bonus
        if (registry.isSpecialPassiveSkill(skill) && skill.name === 'Cochilada Mística') {
          // Check if skill can be triggered
          const canTrigger = await skill.canTrigger(userId, {});
          if (canTrigger) {
            // Calculate the result (don't execute yet)
            const result = skill.calculate(context);
            return {
              hasBonuses: true,
              bonusMultiplier: result.multiplier || 0.5, // Default to 50%
              bonusDescription: result.description
            };
          }
        }
      }
      
      return { hasBonuses: false, bonusMultiplier: 0, bonusDescription: '' };
    } catch (error) {
      console.error('Error checking post-rest bonuses:', error);
      return { hasBonuses: false, bonusMultiplier: 0, bonusDescription: '' };
    }
  }
  
  /**
   * Apply achievement point bonuses (like Bruxo's Topo da Montanha)
   */
  static async applyAchievementBonus(
    userId: string,
    userClass: string | null,
    points: number
  ): Promise<{
    applied: boolean;
    totalPoints: number;
    bonusPoints: number;
  }> {
    if (!userId || !userClass) {
      return { applied: false, totalPoints: points, bonusPoints: 0 };
    }
    
    try {
      // Get registry instance
      const registry = getClassRegistry();
      
      // Get class configuration
      const classConfig = registry.getClassConfig(userClass);
      if (!classConfig) {
        return { applied: false, totalPoints: points, bonusPoints: 0 };
      }
      
      // Check if class has achievement bonus
      // For now, only Bruxo has TopoDaMontanha
      const passiveSkills = registry.getClassPassiveSkills(userClass);
      
      for (const skill of passiveSkills) {
        // Check if this is a special skill that provides achievement bonus
        if (registry.isSpecialPassiveSkill(skill) && skill.name === 'Topo da Montanha') {
          // Check if skill can be triggered
          const canTrigger = await skill.canTrigger(userId, {});
          if (canTrigger) {
            // Execute the skill
            const executed = await skill.execute(userId, { points });
            if (executed) {
              const result = skill.calculate({ 
                userId, 
                userClass, 
                streak: 0,
                baseXP: 0,
                durationMinutes: 0,
                exerciseTypes: {},
                totalExercises: 0,
                exerciseCount: 0,  // Added missing property
                setCount: 0,       // Added missing property
                hasPR: false,
                streakMultiplier: 0
              });
              
              const multiplier = result.multiplier || 0.5; // Default to 50%
              const bonusPoints = Math.round(points * multiplier);
              
              return {
                applied: true,
                totalPoints: points + bonusPoints,
                bonusPoints
              };
            }
          }
        }
      }
      
      return { applied: false, totalPoints: points, bonusPoints: 0 };
    } catch (error) {
      console.error('Error applying achievement bonus:', error);
      return { applied: false, totalPoints: points, bonusPoints: 0 };
    }
  }
  
  /**
   * Record passive skill usage
   */
  static async recordPassiveSkillUsage(
    userId: string,
    skillName: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('passive_skill_usage')
        .insert({
          user_id: userId,
          skill_name: skillName,
          used_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error recording passive skill usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording passive skill usage:', error);
      return false;
    }
  }
  
  /**
   * Check if passive skill is on cooldown
   */
  static async isPassiveSkillOnCooldown(
    userId: string,
    skillName: string,
    cooldownDays: number = 7
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', skillName)
        .gte('used_at', new Date(Date.now() - (cooldownDays * 24 * 60 * 60 * 1000)).toISOString())
        .maybeSingle();
        
      if (error) {
        console.error('Error checking passive skill cooldown:', error);
        return true; // Assume on cooldown if there's an error
      }
      
      return !!data; // On cooldown if data exists
    } catch (error) {
      console.error('Error checking passive skill cooldown:', error);
      return true; // Assume on cooldown if there's an error
    }
  }
}
