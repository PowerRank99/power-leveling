
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecord } from './PersonalRecordService';
import { PersonalRecordService } from './PersonalRecordService';

interface XPBreakdown {
  base: number;
  classBonus: number;
  streakBonus: number;
  recordBonus: number;
}

/**
 * Service for handling XP bonuses and updates
 */
export class XPBonusService {
  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    personalRecords: PersonalRecord[] = []
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('No userId provided to awardXP');
        return false;
      }

      console.log(`Awarding base ${baseXP} XP to user ${userId}`);
      
      // Get user profile and class bonuses (if any)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level, class, workouts_count, streak')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return false;
      }
      
      let totalXP = baseXP;
      let xpBreakdown = {
        base: baseXP,
        classBonus: 0,
        streakBonus: 0,
        recordBonus: 0
      };
      
      // Apply class bonuses if user has selected a class
      await this.applyClassBonuses(profile.class, baseXP, xpBreakdown);
      totalXP += xpBreakdown.classBonus;
      
      // Apply streak bonus
      if (profile.streak && profile.streak > 1) {
        const streakMultiplier = XPCalculationService.getStreakMultiplier(profile.streak);
        const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));
        xpBreakdown.streakBonus = streakBonus;
        totalXP += streakBonus;
        console.log(`Applied streak bonus (${profile.streak} days): +${streakBonus} XP`);
      }
      
      // Apply personal record bonuses (not subject to daily cap)
      let recordBonusXP = 0;
      if (personalRecords.length > 0) {
        // Limit to one PR bonus per workout to prevent farming
        recordBonusXP = XPCalculationService.PR_BONUS_XP;
        console.log(`Applied personal record bonus: +${recordBonusXP} XP`);
        
        // Record which exercises had PRs (for weekly cooldown)
        for (const record of personalRecords) {
          await PersonalRecordService.recordPersonalRecord(
            userId, 
            record.exerciseId, 
            record.weight, 
            record.previousWeight
          );
        }
      }
      xpBreakdown.recordBonus = recordBonusXP;
      
      // Apply daily XP cap (default 300 XP per day from regular workout XP)
      // PR bonuses are exempt from the cap
      const cappedWorkoutXP = Math.min(totalXP, XPCalculationService.DAILY_XP_CAP);
      const totalXPWithBonuses = cappedWorkoutXP + recordBonusXP;
      
      // Update profile and check for level up
      await this.updateProfileXP(userId, profile, totalXPWithBonuses);
      
      // Show toast with XP breakdown
      this.showXPToast(totalXPWithBonuses, xpBreakdown);
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }

  /**
   * Apply class-specific bonuses to XP
   */
  private static async applyClassBonuses(
    userClass: string | null | undefined,
    baseXP: number,
    xpBreakdown: XPBreakdown
  ): Promise<void> {
    try {
      if (!userClass) return;
      
      const { data: bonuses } = await supabase
        .from('class_bonuses')
        .select('bonus_type, bonus_value, description')
        .eq('class_name', userClass);
        
      if (bonuses && bonuses.length > 0) {
        // Apply class-specific bonuses
        const completionBonus = bonuses.find(b => b.bonus_type === 'workout_completion');
        if (completionBonus) {
          const bonusXP = Math.floor(baseXP * completionBonus.bonus_value);
          xpBreakdown.classBonus = bonusXP;
          console.log(`Applied class bonus (${completionBonus.description}): +${bonusXP} XP`);
        }
      }
    } catch (error) {
      console.error('Error applying class bonuses:', error);
    }
  }

  /**
   * Update user profile with new XP and check for level up
   */
  private static async updateProfileXP(
    userId: string,
    profile: { xp: number; level: number; workouts_count: number },
    totalXP: number
  ): Promise<void> {
    try {
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
        return;
      }
      
      if (shouldLevelUp) {
        toast.success(`🎉 Nível Aumentado!`, {
          description: `Parabéns! Você alcançou o nível ${newLevel}!`
        });
      }
    } catch (error) {
      console.error('Error updating profile XP:', error);
    }
  }

  /**
   * Show toast notification with XP breakdown
   */
  private static showXPToast(totalXP: number, xpBreakdown: XPBreakdown): void {
    let toastDesc = 'Treino completo!';
    
    if (xpBreakdown.classBonus > 0 || xpBreakdown.streakBonus > 0 || xpBreakdown.recordBonus > 0) {
      const bonuses = [];
      if (xpBreakdown.classBonus > 0) bonuses.push(`Classe: +${xpBreakdown.classBonus}`);
      if (xpBreakdown.streakBonus > 0) bonuses.push(`Streak: +${xpBreakdown.streakBonus}`);
      if (xpBreakdown.recordBonus > 0) bonuses.push(`Recorde: +${xpBreakdown.recordBonus}`);
      toastDesc = `Base: ${xpBreakdown.base} | ${bonuses.join(' | ')}`;
    }
    
    toast.success(`+${totalXP} XP`, {
      description: toastDesc
    });
  }
}
