
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for verifying routine access and updating usage
 */
export const useWorkoutVerification = () => {
  /**
   * Verifies if a user has access to a routine
   */
  const verifyRoutineAccess = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      throw new Error("Missing routineId or userId in verifyRoutineAccess");
    }
    
    console.log("Verifying routine access for user:", userId, "routine:", routineId);
    
    const { data: routine, error } = await supabase
      .from('routines')
      .select('id')
      .eq('id', routineId)
      .eq('user_id', userId)
      .single();
      
    if (error || !routine) {
      console.error("Error verifying routine access:", error);
      throw new Error("Você não tem acesso a esta rotina.");
    }
    
    console.log("Access verified for user to routine:", routineId);
    return true;
  };
  
  /**
   * Updates the last_used_at timestamp for a routine
   */
  const updateRoutineUsage = async (routineId: string) => {
    try {
      console.log("Updating routine usage timestamp for:", routineId);
      
      const { error } = await supabase
        .from('routines')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', routineId);
        
      if (error) {
        console.error("Error updating routine usage:", error);
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateRoutineUsage:", error);
      return false;
    }
  };
  
  return {
    verifyRoutineAccess,
    updateRoutineUsage
  };
};
