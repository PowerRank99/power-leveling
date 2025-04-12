
import { supabase } from '@/integrations/supabase/client';
import { XPToastService } from './bonus/XPToastService';

// Define XPBreakdown interface for proper typing
export interface XPBreakdown {
  baseXP: number;
  classBonus?: number;
  streakBonus?: number;
  totalXP: number;
}

/**
 * Service for handling XP bonuses
 */
export class XPBonusService {
  // XP Constants
  static readonly WEEKLY_COMPLETION_BONUS = 100;
  static readonly MONTHLY_COMPLETION_BONUS = 300;
  
  /**
   * Award XP to a user and update their level
   */
  static async awardXP(
    userId: string, 
    amount: number,
    bypassDailyCap: boolean = false
  ): Promise<boolean> {
    try {
      if (!userId || amount <= 0) {
        return false;
      }
      
      // Get user's current XP and level
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        return false;
      }
      
      const currentXP = user?.xp || 0;
      const currentLevel = user?.level || 1;
      
      // Calculate new XP and level
      const newXP = currentXP + amount;
      const newLevel = this.calculateLevel(newXP);
      
      // Update user's XP and level
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          xp: newXP,
          level: newLevel
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return false;
      }
      
      // Show XP toast notification
      XPToastService.showXPToast(amount, newLevel > currentLevel);
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }
  
  /**
   * Calculate level based on XP
   * This uses a progressive formula where each level requires more XP than the last
   */
  private static calculateLevel(xp: number): number {
    // Base XP required for level 2
    const baseXP = 150;
    
    // Scaling factor for XP requirements
    const scalingFactor = 1.10;
    
    // Max level is 99
    const maxLevel = 99;
    
    if (xp < baseXP) {
      return 1;
    }
    
    let level = 2;
    let cumulativeXP = baseXP;
    let nextLevelXP = Math.floor(baseXP * scalingFactor);
    
    while (cumulativeXP <= xp && level < maxLevel) {
      level++;
      cumulativeXP += nextLevelXP;
      nextLevelXP = Math.floor(nextLevelXP * scalingFactor);
    }
    
    if (cumulativeXP > xp) {
      level--;
    }
    
    return level;
  }
  
  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    
    // Base XP required for level 2
    const baseXP = 150;
    
    // Scaling factor for XP requirements
    const scalingFactor = 1.10;
    
    let cumulativeXP = 0;
    let levelXP = baseXP;
    
    for (let i = 2; i <= level; i++) {
      cumulativeXP += levelXP;
      levelXP = Math.floor(levelXP * scalingFactor);
    }
    
    return cumulativeXP;
  }
}
