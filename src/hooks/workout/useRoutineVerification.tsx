
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRoutineVerification = () => {
  /**
   * Verifies that a routine exists and belongs to the current user
   */
  const verifyRoutineAccess = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      throw new Error("Routine ID or User ID missing");
    }

    console.log("Verifying routine access for routine ID:", routineId);
    
    const { data: routineData, error: routineCheckError } = await supabase
      .from('routines')
      .select('id, name')
      .eq('id', routineId)
      .eq('user_id', userId)
      .single();
    
    if (routineCheckError) {
      console.error("Error verifying routine:", routineCheckError);
      throw new Error("Rotina não encontrada ou não autorizada");
    }

    return routineData;
  };

  /**
   * Updates the last used timestamp for a routine
   */
  const updateRoutineUsage = async (routineId: string) => {
    await supabase
      .from('routines')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', routineId);
  };

  return {
    verifyRoutineAccess,
    updateRoutineUsage
  };
};
