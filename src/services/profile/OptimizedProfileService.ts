
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResult, createErrorResult } from '@/utils/serviceUtils';
import { DatabaseResult } from '@/types/workout';

export class OptimizedProfileService {
  private static readonly CACHE_KEY = 'profile_data';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static cache: { data: any; timestamp: number } | null = null;

  static async getUserProfileData(userId: string): Promise<DatabaseResult<any>> {
    try {
      // Check cache first
      if (this.cache && (Date.now() - this.cache.timestamp < this.CACHE_DURATION)) {
        return createSuccessResult(this.cache.data);
      }

      const { data, error } = await supabase
        .rpc('get_user_profile_dashboard', { p_user_id: userId });

      if (error) {
        console.error('Error fetching profile data:', error);
        return createErrorResult(error);
      }

      // Update cache
      this.cache = {
        data,
        timestamp: Date.now()
      };

      return createSuccessResult(data);
    } catch (error) {
      console.error('Error in getUserProfileData:', error);
      return createErrorResult(error);
    }
  }

  static clearCache() {
    this.cache = null;
  }
}
