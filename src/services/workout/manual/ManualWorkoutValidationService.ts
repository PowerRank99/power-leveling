
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log("Checking for recent workouts for user:", userId);
      
      try {
        const { data: recentCount, error } = await supabase.rpc(
          'check_recent_manual_workouts',
          { p_user_id: userId, p_hours: 24 }
        );
        
        if (error) {
          console.error("Error checking recent workouts:", error);
          throw new Error('Erro ao verificar treinos recentes');
        }
        
        if (recentCount && recentCount > 0) {
          console.log("Found recent manual workouts:", recentCount);
          throw new Error('Você já registrou um treino manual nas últimas 24 horas');
        }
        
        console.log("No recent manual workouts found, validation passed");
        return true;
      } catch (dbError) {
        console.error("Database error in validation:", dbError);
        
        // Fallback to direct query if RPC fails
        const { data: recentWorkouts, error: recentError } = await supabase
          .from('manual_workouts')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        if (recentError) {
          console.error('Error checking recent submissions:', recentError);
          throw new Error('Erro ao verificar submissões recentes');
        }
        
        const recentCount = recentWorkouts?.length || 0;
        
        if (recentCount > 0) {
          throw new Error('Você já registrou um treino manual nas últimas 24 horas');
        }
        
        return true;
      }
    } catch (error: any) {
      console.error("Validation error:", error.message);
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
