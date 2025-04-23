
import { supabase } from '@/integrations/supabase/client';
import { isTestingMode } from '@/config/testingMode';

/**
 * Service for handling Power Day functionality
 */
export class PowerDayService {
  static readonly POWER_DAY_CAP = 500;

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
   * Check if a user meets Power Day requirements:
   * 1. At least 2 workouts completed today
   * 2. Combined XP EXCEEDS 300 XP (not just equal to 300)
   */
  static async checkPowerDayEligibility(userId: string): Promise<{ eligible: boolean; reason: string }> {
    try {
      // Skip check in testing mode
      if (isTestingMode()) {
        console.log('🔧 Testing mode: Power Day eligibility skipped');
        return { eligible: false, reason: 'Testing mode active' };
      }
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check workout count
      const [{ count: trackedCount }, { count: manualCount }] = await Promise.all([
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
      
      const totalWorkoutsToday = (trackedCount || 0) + (manualCount || 0);
      
      if (totalWorkoutsToday < 2) {
        return {
          eligible: false,
          reason: `Precisa de 2+ treinos hoje (atual: ${totalWorkoutsToday})`
        };
      }
      
      // Check daily XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_xp')
        .eq('id', userId)
        .single();
        
      if (!profile || profile.daily_xp <= 300) {
        return {
          eligible: false,
          reason: `XP diário precisa ultrapassar 300 (atual: ${profile?.daily_xp || 0})`
        };
      }
      
      // Finally check availability
      const { available, used } = await this.checkPowerDayAvailability(userId);
      
      if (!available) {
        return {
          eligible: false,
          reason: `Limite semanal atingido (${used}/2 Power Days usados)`
        };
      }
      
      return {
        eligible: true,
        reason: 'Todos os requisitos atendidos'
      };
    } catch (error) {
      console.error('Error checking Power Day eligibility:', error);
      return { eligible: false, reason: 'Erro ao verificar elegibilidade' };
    }
  }

  /**
   * Get power day usage for a user in a specific week
   */
  static async getPowerDayUsage(userId: string, week: number, year: number): Promise<{ count: number }> {
    try {
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', week)
        .eq('year', year);
      
      if (error) {
        console.error('Error checking power day usage:', error);
        return { count: 0 };
      }
      
      return { count: data?.length || 0 };
    } catch (error) {
      console.error('Error checking power day usage:', error);
      return { count: 0 };
    }
  }

  /**
   * Check power day availability
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ 
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      // Skip availability check in testing mode
      if (isTestingMode()) {
        console.log('🔧 Testing mode: Power Day availability check skipped');
        return {
          available: true,  // Always available in testing mode
          used: 0,
          max: 2,
          week: 0,
          year: 0
        };
      }
      
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      const usedCount = data?.length || 0;
      
      return {
        available: usedCount < 2,
        used: usedCount,
        max: 2,
        week: currentWeek,
        year: currentYear
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return {
        available: false,
        used: 0,
        max: 2,
        week: 0,
        year: 0
      };
    }
  }
  
  /**
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    try {
      if (isTestingMode()) {
        console.log('🔧 Testing mode: Power Day usage recording skipped');
        return true;
      }
      
      const { error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: week,
          year: year
        });
      
      if (error) {
        console.error('Error recording power day usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording power day usage:', error);
      return false;
    }
  }
  
  /**
   * Get a human-readable explanation of Power Day requirements
   */
  static getPowerDayRequirementsText(): string {
    return `
    Power Day é ativado quando:
    1. Você completa 2 ou mais treinos no mesmo dia
    2. Esses treinos, juntos, ultrapassam 300 XP (não apenas atingem)
    3. Você ainda não atingiu o limite semanal de 2 Power Days
    
    Quando ativado, você pode ganhar até 500 XP naquele dia!
    `;
  }
}
