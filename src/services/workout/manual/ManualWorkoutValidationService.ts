
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isTestingMode } from '@/config/testingMode';

/**
 * Service for validating manual workout submissions
 */
export class ManualWorkoutValidationService {
  /**
   * Validates a manual workout submission
   */
  static async validateWorkoutSubmission(
    userId: string,
    photoUrl: string,
    submissionDate: Date
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      if (!photoUrl) {
        throw new Error('Foto do treino é obrigatória');
      }
      
      // Skip date validations in testing mode
      if (!isTestingMode()) {
        // Ensure workout date is not in the future
        const now = new Date();
        if (submissionDate > now) {
          throw new Error('Não é possível registrar treinos futuros');
        }
        
        // Ensure workout date is not more than 24 hours in the past
        const timeDiff = now.getTime() - submissionDate.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        
        if (hoursDiff > 24) {
          throw new Error('Data do treino não pode ser mais de 24 horas no passado');
        }
        
        // Check if user has already submitted a manual workout in the last 24 hours
        const { data: recentCountResult, error } = await supabase.rpc(
          'check_recent_manual_workouts',
          { p_user_id: userId, p_hours: 24 }
        );
        
        if (error) {
          console.error("Error checking recent workouts:", error);
          throw new Error('Erro ao verificar treinos recentes');
        }
        
        // Extract count from the result array
        const recentCount = recentCountResult?.[0]?.count || 0;
        
        if (recentCount > 0) {
          throw new Error('Você já registrou um treino manual nas últimas 24 horas');
        }
      } else {
        console.log('🔧 Testing mode: Bypassing date and frequency validations');
      }
      
      return true;
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error('Erro de validação', {
        description: error.message || 'Erro ao validar treino manual'
      });
      return false;
    }
  }
  
  /**
   * Original validation method for backward compatibility
   */
  static async validateSubmission(
    userId: string,
    submissionDate: Date
  ): Promise<{isValid: boolean; error?: string; isPowerDay: boolean}> {
    try {
      // Check if the submission date is valid
      const now = new Date();
      if (submissionDate > now) {
        return { isValid: false, error: 'Não é possível registrar treinos futuros', isPowerDay: false };
      }
      
      // Check if this is a power day based on daily XP (must be > 300, not just equal)
      const isPowerDay = await this.checkPowerDay(userId);
      
      return { isValid: true, isPowerDay };
    } catch (error: any) {
      return { isValid: false, error: error.message, isPowerDay: false };
    }
  }
  
  /**
   * Checks if this is a power day based on updated requirements:
   * 1. User has completed 2+ workouts in the same day
   * 2. These workouts together exceed 300 XP (not just equal to 300)
   */
  static async checkPowerDay(userId: string): Promise<boolean> {
    // In testing mode, always return false for power day to avoid test issues
    if (isTestingMode()) {
      console.log('🔧 Testing mode: Power Day validation disabled for testing');
      return false;
    }
    
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get workouts count from today (both tracked and manual)
      const [{ count: trackedCount, error: trackedError }, { count: manualCount, error: manualError }] = await Promise.all([
        supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('completed_at', today.toISOString())
          .lt('completed_at', tomorrow.toISOString()),
        
        supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('workout_date', today.toISOString())
          .lt('workout_date', tomorrow.toISOString())
      ]);
      
      if (trackedError || manualError) {
        console.error('Error checking workouts count:', { trackedError, manualError });
        return false;
      }
      
      // Get total workout count for today
      const totalWorkoutsToday = (trackedCount || 0) + (manualCount || 0);
      
      // Requirement 1: Must have at least 2 workouts today
      // We subtract 1 since the current one isn't counted yet
      if (totalWorkoutsToday < 1) {
        console.log('Power Day not triggered: Less than 2 workouts today');
        return false;
      }
      
      // Get user's daily XP so far
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('daily_xp')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching daily XP:', profileError);
        return false;
      }
      
      // Requirement 2: Daily XP must EXCEED 300 XP (not just reach it)
      // We check if it's already over 300 XP
      if (profile.daily_xp > 300) {
        // Check if the user still has Power Days available this week
        const { available } = await this.checkPowerDayAvailability(userId);
        
        if (available) {
          console.log('Power Day triggered: 2+ workouts and 300+ XP today, with availability');
          return true;
        } else {
          console.log('Power Day not available: Weekly limit reached');
          return false;
        }
      }
      
      console.log('Power Day not triggered: Daily XP not exceeding 300 (current: ' + profile.daily_xp + ')');
      return false;
    } catch (error) {
      console.error('Error checking power day:', error);
      return false;
    }
  }
  
  /**
   * Checks if a user has Power Day availability this week
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ available: boolean }> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      if (error) {
        console.error('Error checking power day usage:', error);
        return { available: false };
      }
      
      const usedCount = data?.length || 0;
      const available = usedCount < 2;  // Max 2 Power Days per week
      
      return { available };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return { available: false };
    }
  }
  
  /**
   * Get the current ISO week number
   */
  static getCurrentWeek(): number {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    
    // Calculate current week number based on ISO week definition (weeks start on Monday)
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    return weekNum;
  }
  
  /**
   * Records a Power Day usage for the user in the current week
   */
  static async recordPowerDayUsage(userId: string): Promise<boolean> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const { error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: currentWeek,
          year: currentYear
        });
        
      if (error) {
        console.error('Error recording Power Day usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording Power Day usage:', error);
      return false;
    }
  }
}
