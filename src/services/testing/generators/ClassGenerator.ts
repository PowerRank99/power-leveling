
/**
 * Class Data Generator
 * Simulates class selection and changes for testing achievements
 */
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult } from './index';

/**
 * Character classes available in the system
 */
export enum CharacterClass {
  GUERREIRO = 'Guerreiro',
  MONGE = 'Monge',
  NINJA = 'Ninja', 
  DRUIDA = 'Druida',
  BRUXO = 'Bruxo',
  PALADINO = 'Paladino',
  AVENTUREIRO = 'Aventureiro' // Default class
}

/**
 * Options for class change history simulation
 */
export interface ClassChangeHistoryOptions extends GeneratorOptions {
  /** Sequence of classes to simulate (in order) */
  sequence: CharacterClass[];
  /** Days between each class change */
  daysBetweenChanges?: number;
  /** Whether to bypass the cooldown period (15 days) */
  bypassCooldown?: boolean;
  /** Start date for the first class change */
  startDate?: Date;
}

/**
 * Class data generator for testing achievements
 */
export class ClassGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'class-test-data';

  /**
   * Simulate class selection
   * @param userId User ID to change class for
   * @param className Class to select
   * @param options Additional options
   * @returns Promise with operation result
   * 
   * @example
   * ```typescript
   * // Change user class to Guerreiro
   * const result = await classGenerator.simulateClassSelection('user-123', CharacterClass.GUERREIRO);
   * 
   * // Force class change bypassing cooldown
   * const result = await classGenerator.simulateClassSelection('user-123', CharacterClass.NINJA, {
   *   bypassCooldown: true
   * });
   * ```
   */
  async simulateClassSelection(
    userId: string,
    className: CharacterClass,
    options: {
      bypassCooldown?: boolean;
      classSelectedDate?: Date;
      silent?: boolean;
    } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        bypassCooldown = false,
        classSelectedDate = new Date(),
        silent = false
      } = options;

      // Get current profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('class, class_selected_at')
        .eq('id', userId)
        .single();

      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      // If bypassing cooldown or no previous class, update directly
      if (bypassCooldown || !profile.class_selected_at) {
        await supabase
          .from('profiles')
          .update({
            class: className,
            class_selected_at: formatDateForDB(classSelectedDate)
          })
          .eq('id', userId);
      } else {
        // Check if cooldown period has passed (15 days)
        const cooldownEndDate = new Date(profile.class_selected_at);
        cooldownEndDate.setDate(cooldownEndDate.getDate() + 15);

        if (cooldownEndDate > new Date()) {
          return { 
            success: false, 
            error: `Class change on cooldown until ${cooldownEndDate.toLocaleDateString()}` 
          };
        }

        // Cooldown has passed, update class
        await supabase
          .from('profiles')
          .update({
            class: className,
            class_selected_at: formatDateForDB(classSelectedDate)
          })
          .eq('id', userId);
      }

      if (!silent) {
        toast.success('Class changed', {
          description: `User class set to ${className}`
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error changing class';
      if (!options.silent) {
        toast.error('Failed to change class', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Simulate a sequence of class changes over time
   * @param userId User ID to generate class history for
   * @param options Configuration options
   * @returns Promise with operation result
   * 
   * @example
   * ```typescript
   * // Simulate switching between three classes
   * const result = await classGenerator.simulateClassChangeHistory('user-123', {
   *   sequence: [CharacterClass.GUERREIRO, CharacterClass.MONGE, CharacterClass.NINJA],
   *   daysBetweenChanges: 20
   * });
   * 
   * // Simulate class history starting from a specific date
   * const result = await classGenerator.simulateClassChangeHistory('user-123', {
   *   sequence: [CharacterClass.BRUXO, CharacterClass.PALADINO],
   *   startDate: new Date('2023-01-01')
   * });
   * ```
   */
  async simulateClassChangeHistory(
    userId: string,
    options: ClassChangeHistoryOptions
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!options.sequence || options.sequence.length === 0) {
      return { success: false, error: 'Class sequence is required' };
    }

    try {
      const {
        sequence,
        daysBetweenChanges = 20,
        bypassCooldown = true,
        startDate = new Date(new Date().setDate(new Date().getDate() - (sequence.length * daysBetweenChanges))),
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      // Store original class to restore later if needed
      const { data: originalProfile } = await supabase
        .from('profiles')
        .select('class, class_selected_at')
        .eq('id', userId)
        .single();

      // Apply each class change in sequence
      for (let i = 0; i < sequence.length; i++) {
        const changeDate = new Date(startDate);
        changeDate.setDate(changeDate.getDate() + (i * daysBetweenChanges));
        
        // Skip future dates
        if (changeDate > new Date()) {
          continue;
        }
        
        await this.simulateClassSelection(userId, sequence[i], {
          bypassCooldown,
          classSelectedDate: changeDate,
          silent: true // Silence individual notifications
        });
      }

      if (!silent) {
        toast.success('Class change history simulated', {
          description: `Created history with ${sequence.length} class changes`
        });
      }

      // Save original class data as metadata if this is test data
      if (isTestData && originalProfile) {
        await supabase
          .from('profiles')
          .update({
            metadata: {
              originalClass: originalProfile.class,
              originalClassSelectedAt: originalProfile.class_selected_at,
              isTestData: true,
              tag: testDataTag
            }
          })
          .eq('id', userId);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error simulating class history';
      if (!options.silent) {
        toast.error('Failed to simulate class history', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Clean up test-generated class data for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Clean up all class test data
   * const result = await classGenerator.cleanupClassData('user-123');
   * 
   * // Clean up silently
   * const result = await classGenerator.cleanupClassData('user-123', { 
   *   silent: true 
   * });
   * ```
   */
  async cleanupClassData(
    userId: string,
    options: { silent?: boolean; resetToDefault?: boolean } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        silent = false,
        resetToDefault = true
      } = options;

      // Get profile with metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', userId)
        .single();

      if (profile?.metadata?.originalClass) {
        // Restore original class data
        await supabase
          .from('profiles')
          .update({
            class: profile.metadata.originalClass,
            class_selected_at: profile.metadata.originalClassSelectedAt,
            metadata: null // Clear metadata
          })
          .eq('id', userId);
      } else if (resetToDefault) {
        // Reset to default class
        await supabase
          .from('profiles')
          .update({
            class: CharacterClass.AVENTUREIRO,
            class_selected_at: null
          })
          .eq('id', userId);
      }

      if (!silent) {
        toast.success('Class data cleaned up', {
          description: 'Class data has been reset to original state'
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up class data';
      if (!options.silent) {
        toast.error('Failed to clean up class data', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
