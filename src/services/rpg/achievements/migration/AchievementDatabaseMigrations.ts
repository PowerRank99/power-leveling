
import { supabase } from '@/integrations/supabase/client';

/**
 * Execute SQL migration for database functions to support achievement migrations
 * These functions are created only once and will be used by the migration service
 */
export async function setupMigrationFunctions(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Function to create a backup of the achievements table
    const createBackupFuncResult = await supabase.rpc(
      'create_function_for_achievement_backup',
      {}
    );
    
    if (createBackupFuncResult.error) {
      console.error('Error creating backup function:', createBackupFuncResult.error);
      return {
        success: false,
        message: `Failed to create backup function: ${createBackupFuncResult.error.message}`
      };
    }
    
    // Function to restore from a backup table
    const createRestoreFuncResult = await supabase.rpc(
      'create_function_for_achievement_restore',
      {}
    );
    
    if (createRestoreFuncResult.error) {
      console.error('Error creating restore function:', createRestoreFuncResult.error);
      return {
        success: false,
        message: `Failed to create restore function: ${createRestoreFuncResult.error.message}`
      };
    }
    
    // Function to standardize string IDs
    const createStandardizeFuncResult = await supabase.rpc(
      'create_function_for_standardize_string_id',
      {}
    );
    
    if (createStandardizeFuncResult.error) {
      console.error('Error creating standardize function:', createStandardizeFuncResult.error);
      return {
        success: false,
        message: `Failed to create standardize function: ${createStandardizeFuncResult.error.message}`
      };
    }
    
    return {
      success: true,
      message: 'All migration functions created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to set up migration functions: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
