
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class XPService {
  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(userId: string, baseXP: number): Promise<boolean> {
    try {
      if (!userId) {
        console.error('No userId provided to awardXP');
        return false;
      }

      console.log(`Awarding ${baseXP} XP to user ${userId}`);
      
      // Get user profile and class bonuses (if any)
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level, class')
        .eq('id', userId)
        .single();
      
      if (!profile) {
        console.error('No profile found for user', userId);
        return false;
      }
      
      let totalXP = baseXP;
      
      // Apply class bonuses if user has selected a class
      if (profile.class) {
        const { data: bonuses } = await supabase
          .from('class_bonuses')
          .select('bonus_type, bonus_value')
          .eq('class_name', profile.class);
          
        if (bonuses && bonuses.length > 0) {
          // For now just apply a flat bonus based on workout completion
          // In the future we could apply specific bonuses based on workout type
          const completionBonus = bonuses.find(b => b.bonus_type === 'workout_completion');
          if (completionBonus) {
            const bonusXP = Math.floor(baseXP * completionBonus.bonus_value);
            totalXP += bonusXP;
            console.log(`Applied class bonus: +${bonusXP} XP`);
          }
        }
      }
      
      // Calculate new XP and level
      const currentXP = profile.xp || 0;
      const currentLevel = profile.level || 1;
      const newXP = currentXP + totalXP;
      
      // Check for level up (simple formula: each level needs level*100 XP)
      const xpForNextLevel = currentLevel * 100;
      const shouldLevelUp = currentXP < xpForNextLevel && newXP >= xpForNextLevel;
      const newLevel = shouldLevelUp ? currentLevel + 1 : currentLevel;
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          xp: newXP,
          level: newLevel,
          workouts_count: (profile.workouts_count || 0) + 1,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user XP:', error);
        return false;
      }
      
      if (shouldLevelUp) {
        toast.success(`🎉 Nível Aumentado!`, {
          description: `Parabéns! Você alcançou o nível ${newLevel}!`
        });
      }
      
      toast.success(`+${totalXP} XP`, {
        description: 'Treino completo!'
      });
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }
}
