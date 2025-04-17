import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for handling profile XP updates and level progression
 */
export class ProfileXPService {
  /**
   * Calculate the correct level based on total XP
   * Each level requires (level * 100) XP
   */
  private static calculateLevel(totalXP: number): number {
    let level = 1;
    let xpRequired = 0;
    
    // Keep increasing level until we find the correct one
    while (level < 99) {  // Cap at level 99
      xpRequired += level * 100;
      if (totalXP < xpRequired) {
        return level;
      }
      level++;
    }
    
    return 99; // Maximum level
  }

  /**
   * Update user profile with new XP and calculate correct level
   */
  static async updateProfileXP(
    userId: string,
    profile: { xp: number; level: number; workouts_count: number },
    earnedXP: number
  ): Promise<void> {
    try {
      // Calculate new total XP
      const newTotalXP = (profile.xp || 0) + earnedXP;
      
      // Calculate correct level based on total XP
      const newLevel = this.calculateLevel(newTotalXP);
      
      // Check for level up
      const leveledUp = newLevel > (profile.level || 1);
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          xp: newTotalXP,
          level: newLevel,
          workouts_count: (profile.workouts_count || 0) + 1,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user XP:', error);
        return;
      }
      
      // Show level up toast if applicable
      if (leveledUp) {
        toast.success(`🎉 Nível Aumentado!`, {
          description: `Parabéns! Você alcançou o nível ${newLevel}!`
        });
      }
    } catch (error) {
      console.error('Error updating profile XP:', error);
    }
  }
}
