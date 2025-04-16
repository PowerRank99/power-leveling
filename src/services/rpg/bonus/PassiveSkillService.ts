
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for handling class passive skills
 */
export class PassiveSkillService {
  // One week in milliseconds for cooldown checks
  private static readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Check if Bruxo's Folga Mística passive should preserve streak
   */
  static async checkStreakPreservation(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    
    try {
      // Use regular query to check for passive skill usage
      const { data, error } = await supabase
        .from('passive_skill_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', 'Folga Mística')
        .gte('used_at', new Date(Date.now() - this.ONE_WEEK_MS).toISOString())
        .maybeSingle();
      
      // If there's no data and no error, the player hasn't used it recently
      if (!data && !error) {
        // Record the usage using regular insert
        const { error: insertError } = await supabase
          .from('passive_skill_usage')
          .insert({
            user_id: userId,
            skill_name: 'Folga Mística',
            used_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error recording passive skill usage:', insertError);
          return false;
        }
          
        toast.success('Folga Mística Ativada!', {
          description: 'Seu Bruxo usou magia para preservar sua sequência'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking streak preservation:', error);
      return false;
    }
  }
}
