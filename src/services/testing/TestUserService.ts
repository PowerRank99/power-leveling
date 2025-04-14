
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse } from '@/services/common/ErrorHandlingService';

export interface TestUser {
  id: string;
  email: string;
  createdAt: Date;
}

export class TestUserService {
  private static readonly TEST_EMAIL_DOMAIN = 'test.powerleveling.app';

  /**
   * Create a temporary test user
   */
  static async createTestUser(): Promise<ServiceResponse<TestUser>> {
    try {
      const timestamp = new Date().getTime();
      const email = `test_${timestamp}@${this.TEST_EMAIL_DOMAIN}`;
      const password = `test${timestamp}`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(`Failed to create test user: ${authError?.message}`);
      }

      return createSuccessResponse({
        id: authData.user.id,
        email,
        createdAt: new Date()
      });
    } catch (error) {
      return createErrorResponse(
        'Failed to create test user',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Clean up a test user and all associated data
   */
  static async cleanupTestUser(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Start transaction
      await supabase.rpc('begin_transaction');

      try {
        // Delete user data in specific order to handle foreign key constraints
        const tables = [
          'user_achievements',
          'achievement_progress',
          'workout_sets',
          'workouts',
          'manual_workouts',
          'personal_records',
          'exercise_history',
          'guild_members',
          'guild_raid_participants',
          'power_day_usage',
          'passive_skill_usage',
          'profiles'
        ];

        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('user_id', userId);

          if (error) {
            throw new Error(`Failed to clean up ${table}: ${error.message}`);
          }
        }

        // Delete auth user (requires admin rights)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteError) {
          throw new Error(`Failed to delete auth user: ${deleteError.message}`);
        }

        // Commit transaction
        await supabase.rpc('commit_transaction');

        return createSuccessResponse(true);
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      return createErrorResponse(
        'Failed to cleanup test user',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Check if a user is a test user
   */
  static isTestUser(email: string): boolean {
    return email.endsWith(this.TEST_EMAIL_DOMAIN);
  }
}
