
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/xp/XPService';

/**
 * Service for handling activity-specific bonuses
 */
export class ActivityBonusService {
  /**
   * Get class bonus for activity type
   */
  static async getClassBonus(userId: string, activityType: string): Promise<number> {
    try {
      // Fetch user's current class
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();

      if (profileError || !profileData?.class) {
        return 0;
      }

      // Fetch class bonus for this activity type
      const { data: bonusData, error: bonusError } = await supabase
        .from('class_bonuses')
        .select('bonus_value')
        .eq('class_name', profileData.class)
        .eq('bonus_type', activityType.toLowerCase())
        .single();

      if (bonusError || !bonusData) {
        return 0;
      }

      return bonusData.bonus_value;
    } catch (error) {
      console.error('Error calculating class bonus:', error);
      return 0;
    }
  }

  /**
   * Calculate XP bonus based on activity type, class bonus, and power day status
   */
  static async calculateXPBonus(
    userId: string, 
    activityType: string, 
    baseXP: number, 
    isPowerDay: boolean
  ): Promise<number> {
    // Get class-specific bonus
    const classBonus = await this.getClassBonus(userId, activityType);
    
    // Calculate bonus XP
    let totalXP = baseXP;
    
    // Apply class bonus
    if (classBonus > 0) {
      const bonusXP = Math.round(baseXP * classBonus);
      totalXP += bonusXP;
      
      console.log(`Applied ${classBonus * 100}% class bonus for ${activityType}: +${bonusXP} XP`);
    }
    
    // Add Power Day bonus if applicable
    if (isPowerDay) {
      const powerDayBonus = Math.round(baseXP * 0.5);
      totalXP += powerDayBonus;
      
      console.log(`Added Power Day bonus: +${powerDayBonus} XP`);
    }
    
    return totalXP;
  }
}
