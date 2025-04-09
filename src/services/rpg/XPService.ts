
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';

interface WorkoutData {
  id: string;
  exercises: WorkoutExercise[];
  durationSeconds: number;
  difficulty?: 'iniciante' | 'intermediario' | 'avancado';
}

interface PersonalRecord {
  exerciseId: string;
  weight: number;
  previousWeight: number;
}

export class XPService {
  // XP system constants
  private static DAILY_XP_CAP = 300;
  private static BASE_TIME_XP_RATE = 10; // XP per 10 minutes
  private static BASE_EXERCISE_XP = 5; // XP per exercise
  private static BASE_SET_XP = 2; // XP per set
  private static PR_BONUS_XP = 50; // Bonus XP for personal records
  
  // Difficulty multipliers
  private static DIFFICULTY_MULTIPLIERS = {
    iniciante: 0.8,
    intermediario: 1.0,
    avancado: 1.5,
  };
  
  // Streak multipliers - 5% per day up to 35% at 7 days
  private static getStreakMultiplier(streak: number): number {
    const maxStreakBonus = 7;
    const bonusPerDay = 0.05;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
  
  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(userId: string, baseXP: number, personalRecords: PersonalRecord[] = []): Promise<boolean> {
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
      if (profile.class) {
        const { data: bonuses } = await supabase
          .from('class_bonuses')
          .select('bonus_type, bonus_value, description')
          .eq('class_name', profile.class);
          
        if (bonuses && bonuses.length > 0) {
          // Apply class-specific bonuses
          const completionBonus = bonuses.find(b => b.bonus_type === 'workout_completion');
          if (completionBonus) {
            const bonusXP = Math.floor(baseXP * completionBonus.bonus_value);
            xpBreakdown.classBonus = bonusXP;
            totalXP += bonusXP;
            console.log(`Applied class bonus (${completionBonus.description}): +${bonusXP} XP`);
          }
        }
      }
      
      // Apply streak bonus
      if (profile.streak && profile.streak > 1) {
        const streakMultiplier = this.getStreakMultiplier(profile.streak);
        const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));
        xpBreakdown.streakBonus = streakBonus;
        totalXP += streakBonus;
        console.log(`Applied streak bonus (${profile.streak} days): +${streakBonus} XP`);
      }
      
      // Apply personal record bonuses (not subject to daily cap)
      let recordBonusXP = 0;
      if (personalRecords.length > 0) {
        // Limit to one PR bonus per workout to prevent farming
        recordBonusXP = this.PR_BONUS_XP;
        console.log(`Applied personal record bonus: +${recordBonusXP} XP`);
        
        // Record which exercises had PRs (for weekly cooldown)
        for (const record of personalRecords) {
          await this.recordPersonalRecord(userId, record.exerciseId, record.weight, record.previousWeight);
        }
      }
      xpBreakdown.recordBonus = recordBonusXP;
      
      // Apply daily XP cap (default 300 XP per day from regular workout XP)
      // PR bonuses are exempt from the cap
      const cappedWorkoutXP = Math.min(totalXP, this.DAILY_XP_CAP);
      const totalXPWithBonuses = cappedWorkoutXP + recordBonusXP;
      
      // Calculate new XP and level
      const currentXP = profile.xp || 0;
      const currentLevel = profile.level || 1;
      const newXP = currentXP + totalXPWithBonuses;
      
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
      
      let toastDesc = 'Treino completo!';
      if (xpBreakdown.classBonus > 0 || xpBreakdown.streakBonus > 0 || xpBreakdown.recordBonus > 0) {
        const bonuses = [];
        if (xpBreakdown.classBonus > 0) bonuses.push(`Classe: +${xpBreakdown.classBonus}`);
        if (xpBreakdown.streakBonus > 0) bonuses.push(`Streak: +${xpBreakdown.streakBonus}`);
        if (xpBreakdown.recordBonus > 0) bonuses.push(`Recorde: +${xpBreakdown.recordBonus}`);
        toastDesc = `Base: ${xpBreakdown.base} | ${bonuses.join(' | ')}`;
      }
      
      toast.success(`+${totalXPWithBonuses} XP`, {
        description: toastDesc
      });
      
      return true;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }
  
  /**
   * Records a personal record for an exercise
   */
  private static async recordPersonalRecord(
    userId: string, 
    exerciseId: string, 
    weight: number,
    previousWeight: number
  ): Promise<void> {
    try {
      // Using a raw SQL insert for personal_records since it's not in the TypeScript types yet
      const { error } = await supabase.rpc('insert_personal_record', {
        p_user_id: userId,
        p_exercise_id: exerciseId,
        p_weight: weight,
        p_previous_weight: previousWeight
      });
        
      if (error) {
        console.error('Error recording personal record:', error);
        return;
      }
      
      // Update the records count in profile
      await supabase
        .from('profiles')
        .update({
          records_count: profile => profile.records_count + 1
        })
        .eq('id', userId);
        
    } catch (error) {
      console.error('Error recording personal record:', error);
    }
  }
  
  /**
   * Calculate XP for a completed workout
   * @param workout Workout data
   * @param userClass User's selected class
   * @param streak Current workout streak
   * @param difficulty Workout difficulty level
   */
  static calculateWorkoutXP(
    workout: WorkoutData,
    userClass?: string | null,
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): number {
    try {
      // Base XP calculation
      const timeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
      const baseTimeXP = Math.floor(timeMinutes / 10) * this.BASE_TIME_XP_RATE; // 10 XP per 10 minutes
      const exerciseXP = workout.exercises.length * this.BASE_EXERCISE_XP; // 5 XP per exercise
      
      // Calculate sets XP
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      const setsXP = completedSets * this.BASE_SET_XP; // 2 XP per completed set
      
      // Sum base XP
      let totalXP = baseTimeXP + exerciseXP + setsXP;
      
      // Apply difficulty modifier if available
      if (difficulty in this.DIFFICULTY_MULTIPLIERS) {
        totalXP = Math.round(totalXP * this.DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof this.DIFFICULTY_MULTIPLIERS]);
      }
      
      // Cap at daily maximum
      return Math.min(totalXP, this.DAILY_XP_CAP);
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return 50; // Default XP on error
    }
  }
  
  /**
   * Check if the user has earned a personal record for any exercise
   * in this workout by checking their exercise history
   */
  static async checkForPersonalRecords(
    userId: string, 
    workout: WorkoutData
  ): Promise<PersonalRecord[]> {
    try {
      const personalRecords: PersonalRecord[] = [];
      
      // Get the user's exercise history
      const { data: exerciseHistory } = await supabase
        .from('exercise_history')
        .select('exercise_id, weight')
        .eq('user_id', userId);
        
      if (!exerciseHistory || exerciseHistory.length === 0) {
        return personalRecords;
      }
      
      // Create a lookup map for easier access
      const historyMap = exerciseHistory.reduce((map, record) => {
        map[record.exercise_id] = record.weight;
        return map;
      }, {} as Record<string, number>);
      
      // Check each exercise in the workout for a PR
      for (const exercise of workout.exercises) {
        const exerciseId = exercise.id;
        const previousBest = historyMap[exerciseId] || 0;
        
        // Find the highest weight used for this exercise in the workout
        const highestWeight = exercise.sets.reduce((max, set) => {
          if (set.completed && parseFloat(set.weight) > max) {
            return parseFloat(set.weight);
          }
          return max;
        }, 0);
        
        // If a new PR was set, add it to the list
        if (highestWeight > previousBest && highestWeight > 0) {
          // Check for cooldown period (1 PR per exercise per week)
          const canEarnPR = await this.checkPersonalRecordCooldown(userId, exerciseId);
          
          if (canEarnPR) {
            personalRecords.push({
              exerciseId,
              weight: highestWeight,
              previousWeight: previousBest
            });
          }
        }
      }
      
      return personalRecords;
    } catch (error) {
      console.error('Error checking for personal records:', error);
      return [];
    }
  }
  
  /**
   * Check if an exercise is on cooldown for PR bonuses
   * (1 PR bonus per exercise per week)
   */
  private static async checkPersonalRecordCooldown(
    userId: string, 
    exerciseId: string
  ): Promise<boolean> {
    try {
      // Get the most recent PR for this exercise using RPC
      const { data, error } = await supabase.rpc('check_personal_record_cooldown', {
        p_user_id: userId,
        p_exercise_id: exerciseId,
        p_days: 7
      });
      
      if (error) {
        console.error('Error checking PR cooldown:', error);
        return false;
      }
      
      // Return the result (true = not on cooldown, false = on cooldown)
      return data === true;
    } catch (error) {
      console.error('Error checking personal record cooldown:', error);
      return false; // Default to not allowing PR bonus on error
    }
  }
}
