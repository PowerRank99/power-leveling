
import { supabase } from '@/integrations/supabase/client';
import { TestDataGenerator, GeneratorResult } from './index';

export enum ActivityType {
  YOGA = 'yoga',
  RUNNING = 'running',
  SWIMMING = 'swimming',
  CYCLING = 'cycling',
  HIKING = 'hiking',
  OTHER = 'other'
}

export interface ActivityGenerationOptions {
  count?: number;
  type?: ActivityType | string;
  daysAgo?: number;
  isTestData?: boolean;
  activityDate?: Date;
  description?: string;
}

export class ActivityGenerator implements TestDataGenerator {
  async generate(userId: string, options: ActivityGenerationOptions = {}): Promise<GeneratorResult> {
    try {
      const {
        count = 1,
        type = ActivityType.YOGA,
        daysAgo = 0,
        isTestData = true,
        description = `Generated test activity: ${type}`
      } = options;
      
      const activityIds: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // Create a base activity date
        const activityDate = options.activityDate || new Date();
        
        // If daysAgo is specified, adjust the date
        if (daysAgo > 0) {
          activityDate.setDate(activityDate.getDate() - daysAgo - i);
        }
        
        // Create manual workout
        const { data: activity, error: activityError } = await supabase
          .from('manual_workouts')
          .insert({
            user_id: userId,
            workout_date: activityDate.toISOString(),
            description: description,
            activity_type: type,
            photo_url: 'https://example.com/test-activity.jpg', // Placeholder URL
            xp_awarded: 100,
            is_power_day: false
          })
          .select('id')
          .single();
          
        if (activityError || !activity) {
          throw new Error(`Error creating activity: ${activityError?.message}`);
        }
        
        activityIds.push(activity.id);
        
        // Update profile
        const { error: profileError } = await supabase
          .rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'workouts_count',
            increment_amount: 1
          });
          
        if (profileError) {
          console.error(`Error updating profile: ${profileError.message}`);
        }
      }
      
      return {
        success: true,
        message: `Generated ${count} manual workout(s)`,
        ids: activityIds,
        data: { activityIds }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async generateManualWorkout(userId: string, options: ActivityGenerationOptions = {}): Promise<string | null> {
    try {
      const result = await this.generate(userId, { ...options, count: 1 });
      if (result.success && result.ids && result.ids.length > 0) {
        return result.ids[0];
      }
      return null;
    } catch (error) {
      console.error('Error creating manual workout:', error);
      return null;
    }
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      // Delete manual workouts
      const { error: activityError } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', userId)
        .eq('workout_date', new Date().toISOString().substring(0, 10));
        
      if (activityError) {
        console.error(`Error cleaning up manual workouts: ${activityError.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up manual workouts:', error);
      return false;
    }
  }
}
