
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';

interface WorkoutData {
  id: string;
  exercises: WorkoutExercise[];
  durationSeconds: number;
  difficulty?: 'iniciante' | 'intermediario' | 'avancado';
}

export class XPService {
  private static DAILY_XP_CAP = 300;
  
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
        .select('xp, level, class, workouts_count, streak')
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
          // Apply class-specific bonuses
          const completionBonus = bonuses.find(b => b.bonus_type === 'workout_completion');
          if (completionBonus) {
            const bonusXP = Math.floor(baseXP * completionBonus.bonus_value);
            totalXP += bonusXP;
            console.log(`Applied class bonus: +${bonusXP} XP`);
          }
          
          // Apply streak bonus
          if (profile.streak && profile.streak > 1) {
            const streakMultiplier = Math.min(1 + (profile.streak * 0.05), 1.35); // Cap at 35% bonus
            const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));
            totalXP += streakBonus;
            console.log(`Applied streak bonus (${profile.streak} days): +${streakBonus} XP`);
          }
        }
      }
      
      // Apply daily XP cap (default 300 XP per day)
      totalXP = Math.min(totalXP, this.DAILY_XP_CAP);
      
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
  
  /**
   * Calculate XP for a completed workout
   * @param workout Workout data
   * @param userClass User's selected class
   * @param streak Current workout streak
   */
  static calculateWorkoutXP(
    workout: WorkoutData,
    userClass?: string | null,
    streak: number = 0
  ): number {
    try {
      // Base XP calculation
      const baseTimeXP = Math.floor((workout.durationSeconds || 0) / 60) * 2; // 2 XP per minute
      const exerciseXP = workout.exercises.length * 5; // 5 XP per exercise
      
      // Calculate sets XP
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      const setsXP = completedSets * 2; // 2 XP per completed set
      
      // Sum base XP
      let totalXP = baseTimeXP + exerciseXP + setsXP;
      
      // Apply difficulty modifier if available
      if (workout.difficulty) {
        switch (workout.difficulty) {
          case 'iniciante':
            totalXP = Math.round(totalXP * 0.8);
            break;
          case 'avancado':
            totalXP = Math.round(totalXP * 1.2);
            break;
        }
      }
      
      // Cap at daily maximum
      return Math.min(totalXP, this.DAILY_XP_CAP);
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return 50; // Default XP on error
    }
  }
}
