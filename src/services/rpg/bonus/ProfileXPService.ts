
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
      
      console.log(`Level ${level}: Required XP: ${xpRequired}, User XP: ${totalXP}`);
      
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
      console.log(`Updating XP for user ${userId}:`, {
        currentXP: profile.xp,
        earnedXP,
        newTotalXP
      });
      
      // Calculate correct level based on total XP
      const newLevel = this.calculateLevel(newTotalXP);
      console.log(`Level calculation result:`, {
        oldLevel: profile.level,
        newLevel,
        totalXP: newTotalXP
      });
      
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
  
  /**
   * Check if user has leveled up and show notification
   */
  static async checkLevelUp(
    userId: string,
    oldTotalXP: number,
    newTotalXP: number
  ): Promise<void> {
    try {
      // Calculate old level and new level
      const oldLevel = this.calculateLevel(oldTotalXP);
      const newLevel = this.calculateLevel(newTotalXP);
      
      // Check for level up
      if (newLevel > oldLevel) {
        console.log(`User ${userId} leveled up from ${oldLevel} to ${newLevel}`);
        
        // Show level up toast
        toast.success(`🎉 Nível Aumentado!`, {
          description: `Parabéns! Você alcançou o nível ${newLevel}!`
        });
        
        // Update profile level
        const { error } = await supabase
          .from('profiles')
          .update({ level: newLevel })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user level:', error);
        }
      }
    } catch (error) {
      console.error('Error checking level up:', error);
    }
  }
  
  /**
   * Reset daily XP counter if it's a new day
   * This should be called at the beginning of each workout session
   */
  static async resetDailyXPIfNeeded(userId: string): Promise<void> {
    try {
      // Get user profile with last workout time
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_workout_at, daily_xp')
        .eq('id', userId)
        .single();
        
      if (error || !profile) {
        console.error('Error fetching profile for daily XP reset:', error);
        return;
      }
      
      // If no last workout or daily_xp is already 0, nothing to do
      if (!profile.last_workout_at || profile.daily_xp === 0) {
        return;
      }
      
      // Check if last workout was on a different day
      const lastWorkoutDate = new Date(profile.last_workout_at);
      const today = new Date();
      
      if (lastWorkoutDate.getDate() !== today.getDate() || 
          lastWorkoutDate.getMonth() !== today.getMonth() || 
          lastWorkoutDate.getFullYear() !== today.getFullYear()) {
        
        console.log(`Resetting daily XP for user ${userId} (new day detected)`);
        
        // Reset daily XP counter
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ daily_xp: 0 })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error resetting daily XP:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in resetDailyXPIfNeeded:', error);
    }
  }
}
