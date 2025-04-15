
/**
 * Class Data Generator
 * Simulates class selection and changes for achievement testing
 */
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult } from './index';

/**
 * Available character classes
 */
export enum CharacterClass {
  WARRIOR = 'Guerreiro',
  MONK = 'Monge',
  NINJA = 'Ninja',
  WARLOCK = 'Bruxo',
  PALADIN = 'Paladino',
  DRUID = 'Druida'
}

/**
 * Options for simulating class change history
 */
export interface ClassChangeHistoryOptions extends GeneratorOptions {
  /** Sequence of classes to simulate changes through */
  sequence: CharacterClass[];
  /** Number of days between class changes */
  daysBetweenChanges?: number;
  /** Whether to backdate changes (default: true) */
  allowBackdating?: boolean;
  /** Start date for the sequence (default: calculated from current date) */
  startDate?: Date;
  /** Whether to bypass cooldown restrictions */
  bypassCooldown?: boolean;
}

/**
 * Result of class change operations
 */
export interface ClassChangeResult extends GeneratorResult {
  /** Current class after operation */
  currentClass?: CharacterClass;
  /** Previous class before operation */
  previousClass?: CharacterClass;
  /** When class was changed */
  changedAt?: Date;
}

/**
 * Class data generator for testing achievements
 */
export class ClassGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'class-test-data';
  /** Default cooldown period for class changes in days */
  private readonly CLASS_CHANGE_COOLDOWN_DAYS = 15;

  /**
   * Simulate selecting a class for a user
   * @param userId User ID to set class for
   * @param className Class to select
   * @param options Additional options
   * @returns Promise with operation result
   * 
   * @example
   * ```typescript
   * // Select Warrior class
   * const result = await classGenerator.simulateClassSelection('user-123', CharacterClass.WARRIOR);
   * 
   * // Select Monk class with specific date
   * const result = await classGenerator.simulateClassSelection('user-123', CharacterClass.MONK, {
   *   selectionDate: new Date('2023-05-01'),
   *   bypassCooldown: true
   * });
   * ```
   */
  async simulateClassSelection(
    userId: string,
    className: CharacterClass,
    options: {
      selectionDate?: Date;
      bypassCooldown?: boolean;
      silent?: boolean;
      isTestData?: boolean;
      testDataTag?: string;
    } = {}
  ): Promise<ClassChangeResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!Object.values(CharacterClass).includes(className)) {
      return { success: false, error: 'Invalid class name' };
    }

    try {
      const {
        selectionDate = new Date(),
        bypassCooldown = false,
        silent = false,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG
      } = options;

      // Get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('class, class_selected_at')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }
      
      const previousClass = profile?.class as CharacterClass;
      
      // Check if already the requested class
      if (previousClass === className) {
        if (!silent) {
          toast.info('Class already selected', {
            description: `User already has class ${className}`
          });
        }
        
        return {
          success: true,
          currentClass: className,
          previousClass: previousClass
        };
      }
      
      // Check cooldown unless bypassing
      if (!bypassCooldown && profile?.class_selected_at) {
        const lastChangeDate = new Date(profile.class_selected_at);
        const cooldownEndDate = new Date(lastChangeDate);
        cooldownEndDate.setDate(cooldownEndDate.getDate() + this.CLASS_CHANGE_COOLDOWN_DAYS);
        
        if (cooldownEndDate > new Date()) {
          return {
            success: false,
            error: `Class change on cooldown until ${cooldownEndDate.toISOString()}`,
            currentClass: previousClass
          };
        }
      }
      
      // Update profile with new class
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          class: className,
          class_selected_at: formatDateForDB(selectionDate),
          metadata: isTestData ? { 
            isTestData, 
            tag: testDataTag,
            classChangeHistory: true 
          } : undefined
        })
        .eq('id', userId);
      
      if (updateError) {
        throw new Error(`Failed to update class: ${updateError.message}`);
      }

      if (!silent) {
        toast.success('Class changed', {
          description: `Changed class from ${previousClass || 'None'} to ${className}`
        });
      }

      return {
        success: true,
        currentClass: className,
        previousClass: previousClass,
        changedAt: selectionDate
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error selecting class';
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
   * @param userId User ID to simulate class changes for
   * @param options Configuration options
   * @returns Promise with operation result
   * 
   * @example
   * ```typescript
   * // Simulate changing through all classes
   * const result = await classGenerator.simulateClassChangeHistory('user-123', {
   *   sequence: [
   *     CharacterClass.WARRIOR,
   *     CharacterClass.MONK,
   *     CharacterClass.NINJA,
   *     CharacterClass.WARLOCK,
   *     CharacterClass.PALADIN
   *   ]
   * });
   * 
   * // Simulate specific class change pattern with custom timing
   * const result = await classGenerator.simulateClassChangeHistory('user-123', {
   *   sequence: [CharacterClass.WARRIOR, CharacterClass.MONK, CharacterClass.WARRIOR],
   *   daysBetweenChanges: 20,
   *   bypassCooldown: true
   * });
   * ```
   */
  async simulateClassChangeHistory(
    userId: string,
    options: ClassChangeHistoryOptions
  ): Promise<ClassChangeResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!options.sequence || options.sequence.length === 0) {
      return { success: false, error: 'Sequence is required and must not be empty' };
    }

    try {
      const {
        sequence,
        daysBetweenChanges = this.CLASS_CHANGE_COOLDOWN_DAYS + 1, // Default to just beyond cooldown
        allowBackdating = true,
        bypassCooldown = true, // Default to bypassing cooldown for historical changes
        silent = false,
        testDataTag = this.DEFAULT_TEST_TAG,
        isTestData = true
      } = options;

      // Calculate dates for each class change, going backward from current date
      const today = new Date();
      let finalClass: CharacterClass | undefined;
      let previousClass: CharacterClass | undefined;
      
      // Store original class to restore later if needed
      const { data: profile } = await supabase
        .from('profiles')
        .select('class, class_selected_at')
        .eq('id', userId)
        .single();
      
      const originalClass = profile?.class as CharacterClass;
      const originalChangedAt = profile?.class_selected_at;
      
      // Make each class change in sequence
      for (let i = 0; i < sequence.length; i++) {
        const className = sequence[i];
        
        // Calculate date for this change
        const daysAgo = (sequence.length - 1 - i) * daysBetweenChanges;
        const changeDate = new Date(today);
        changeDate.setDate(changeDate.getDate() - daysAgo);
        
        // Skip future dates
        if (changeDate > today && !allowBackdating) {
          continue;
        }
        
        // Make the class change
        const result = await this.simulateClassSelection(userId, className, {
          selectionDate: changeDate,
          bypassCooldown,
          silent: true, // Silence individual notifications
          isTestData,
          testDataTag
        });
        
        if (!result.success) {
          console.warn(`Failed to change to class ${className}:`, result.error);
          continue;
        }
        
        // Track final class and previous class
        if (i === sequence.length - 1) {
          finalClass = className;
        }
        if (i === sequence.length - 2) {
          previousClass = className;
        }
      }

      if (!silent) {
        toast.success('Class change history simulated', {
          description: `Simulated ${sequence.length} class changes`
        });
      }

      return {
        success: true,
        currentClass: finalClass,
        previousClass: previousClass
      };
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
   * Clean up class test data by resetting to original state
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Reset class data to original state
   * const result = await classGenerator.cleanupClassData('user-123');
   * 
   * // Reset to a specific class
   * const result = await classGenerator.cleanupClassData('user-123', {
   *   resetToClass: CharacterClass.WARRIOR
   * });
   * ```
   */
  async cleanupClassData(
    userId: string,
    options: {
      silent?: boolean;
      resetToClass?: CharacterClass;
      resetClassSelectedAt?: boolean;
    } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        silent = false, 
        resetToClass,
        resetClassSelectedAt = true
      } = options;

      let updateData: any = {};
      
      // Set class if provided
      if (resetToClass) {
        updateData.class = resetToClass;
      }
      
      // Reset class_selected_at if requested
      if (resetClassSelectedAt) {
        updateData.class_selected_at = null;
      }
      
      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        // Also clear test metadata
        updateData.metadata = {};
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        
        if (updateError) {
          throw new Error(`Failed to reset class data: ${updateError.message}`);
        }
      }

      if (!silent) {
        toast.success('Class data cleaned up', {
          description: resetToClass 
            ? `Reset class to ${resetToClass}` 
            : 'Cleaned up class test data'
        });
      }

      return {
        success: true
      };
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
