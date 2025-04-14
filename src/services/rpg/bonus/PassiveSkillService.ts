
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BruxoBonus } from '../calculations/class-bonuses/BruxoBonus';
import { DruidaBonus } from '../calculations/class-bonuses/DruidaBonus';

/**
 * Service for handling class passive skills
 */
export class PassiveSkillService {
  // One week in milliseconds for cooldown checks
  private static readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Check if Bruxo should preserve partial streak using Pijama Arcano
   * When Bruxo doesn't train, streak bonus reduced by 5 percentage points per day (instead of resetting)
   * 
   * @param userId User ID
   * @param userClass User class
   * @param currentStreakPercentage Current streak bonus percentage (0-35)
   * @param daysMissed Number of days missed
   * @returns New streak percentage (0-35)
   */
  static getStreakReductionPercentage(
    userId: string, 
    userClass: string | null, 
    currentStreakPercentage: number, 
    daysMissed: number
  ): number {
    if (!userId || userClass !== 'Bruxo' || daysMissed <= 0) return 0;
    
    // For Bruxo, calculate streak reduction in percentage points
    const newStreakPercentage = BruxoBonus.getStreakReductionPercentage(currentStreakPercentage, daysMissed);
    
    // Only show a notification if this is actually preserving some streak
    if (newStreakPercentage > 0) {
      toast.success('Pijama Arcano Ativado!', {
        description: `Seu Bruxo preservou ${newStreakPercentage}% de bônus de sequência`
      });
    }
    
    return newStreakPercentage;
  }
  
  /**
   * Apply Bruxo's achievement point bonus (Topo da Montanha)
   * When Bruxo completes an achievement, gets 50% more achievement points
   */
  static async applyAchievementPointsBonus(
    userId: string, 
    userClass: string | null, 
    basePoints: number
  ): Promise<number> {
    if (!userId || userClass !== 'Bruxo') return basePoints;
    
    try {
      const shouldApplyBonus = await BruxoBonus.shouldApplyAchievementBonus(userId);
      
      if (shouldApplyBonus) {
        // Record the passive skill usage
        await supabase
          .from('passive_skill_usage')
          .insert({
            user_id: userId,
            skill_name: 'Topo da Montanha',
            used: true,
            used_at: new Date().toISOString()
          });
        
        // Apply 50% bonus to achievement points
        const bonusPoints = Math.round(basePoints * 0.5);
        
        toast.success('Topo da Montanha Ativado!', {
          description: `Seu Bruxo ganhou ${bonusPoints} pontos de conquista bônus`
        });
        
        return basePoints + bonusPoints;
      }
      
      return basePoints;
    } catch (error) {
      console.error('Error applying achievement points bonus:', error);
      return basePoints;
    }
  }
  
  /**
   * Check for Druida's Cochilada Mística skill and apply XP bonus
   * When Druida doesn't train, earns a 50% XP bonus on next workout
   */
  static async applyDruidaRestBonus(
    userId: string, 
    userClass: string | null, 
    baseXP: number
  ): Promise<number> {
    if (!userId || userClass !== 'Druida') return baseXP;
    
    try {
      const { applyBonus, multiplier } = await DruidaBonus.shouldApplyRestBonus(userId);
      
      if (applyBonus) {
        const bonusXP = Math.round(baseXP * (multiplier - 1));
        
        toast.success('Cochilada Mística Ativada!', {
          description: `Seu Druida ganhou ${bonusXP} XP bônus por descansar`
        });
        
        return baseXP + bonusXP;
      }
      
      return baseXP;
    } catch (error) {
      console.error('Error applying Druida rest bonus:', error);
      return baseXP;
    }
  }
}
