
import { supabase } from '@/integrations/supabase/client';

export class PersonalRecordChecker {
  static async checkPersonalRecordAchievements(
    userId: string,
    unlockedIds: string[],
    remainingAchievements: any[]
  ): Promise<void> {
    try {
      // Get "First PR" achievement if not already unlocked
      const recordAchievement = remainingAchievements.find(a => a.string_id === 'pr-first');
      
      if (!recordAchievement || unlockedIds.includes(recordAchievement.id)) {
        return;
      }
      
      // Get personal records count
      const { count } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!count || count === 0) {
        console.log('[PersonalRecordChecker] No personal records found');
        return;
      }
      
      console.log(`[PersonalRecordChecker] Found ${count} personal records`);
      
      // Award achievement since we found at least one PR
      await supabase.rpc('check_achievement_batch', {
        p_user_id: userId,
        p_achievement_ids: [recordAchievement.id]
      });
      
    } catch (error) {
      console.error('Error in checkPersonalRecordAchievements:', error);
    }
  }
}
