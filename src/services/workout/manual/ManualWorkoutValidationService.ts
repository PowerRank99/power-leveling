
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
   * Gets the current ISO week number
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
   * Check power day availability - delegates to PowerDayService now
   * This avoids duplication of logic and potential inconsistencies
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ available: boolean }> {
    // Import and delegate to PowerDayService
    const { PowerDayService } = await import('@/services/rpg/bonus/PowerDayService');
    
    // Forward the request to the PowerDayService, which is the canonical source for this functionality
    const result = await PowerDayService.checkPowerDayAvailability(userId);
    return { available: result.available };
  }
}
