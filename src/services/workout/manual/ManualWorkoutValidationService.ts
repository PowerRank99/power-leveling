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
   * Checks if this is a power day (user has completed a regular workout today)
   */
  static async checkPowerDay(userId: string): Promise<boolean> {
    // In testing mode, always return true for power day
    if (isTestingMode()) {
      console.log('🔧 Testing mode: Power Day always available');
      return true;
    }
    
    try {
      // Check if the user has a completed workout today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: workoutsToday, error: workoutError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        
      if (workoutError) {
        console.error('Error checking today workouts:', workoutError);
        return false;
      }
      
      return (workoutsToday && workoutsToday > 0);
    } catch (error) {
      console.error('Error checking power day:', error);
      return false;
    }
  }
}
