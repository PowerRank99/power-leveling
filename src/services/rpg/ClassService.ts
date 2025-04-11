
import { ClassInfo, ClassBonus, CooldownInfo, ClassBonusBreakdown } from './types/classTypes';
import { ClassUtils } from './utils/classUtils';
import { ClassApiService } from './api/classApiService';
import { CLASS_PASSIVE_SKILLS } from './constants/exerciseTypes';

/**
 * Service for class system operations
 */
export class ClassService {
  // Re-export the class utils methods
  static readonly CLASS_INFO = ClassUtils.CLASS_METADATA;
  static readonly CLASS_PASSIVE_SKILLS = CLASS_PASSIVE_SKILLS;
  
  /**
   * Get the list of available class options with metadata
   */
  static async getClassOptions(): Promise<ClassInfo[]> {
    return ClassApiService.getClassOptions();
  }
  
  /**
   * Select a class for the current user
   */
  static async selectClass(userId: string, className: string): Promise<boolean> {
    return ClassApiService.selectClass(userId, className);
  }
  
  /**
   * Check if user is on cooldown for class changes
   */
  static async getClassCooldown(userId: string): Promise<CooldownInfo | null> {
    return ClassApiService.getClassCooldown(userId);
  }
  
  /**
   * Format a cooldown duration into a readable string
   */
  static formatCooldownTime(cooldownEndsAt: string | null): string {
    return ClassUtils.formatCooldownTime(cooldownEndsAt);
  }
  
  /**
   * Get a class icon component based on class name
   */
  static getClassIcon(className: string | null): string {
    return ClassUtils.getClassIcon(className);
  }
  
  /**
   * Get class description based on class name
   */
  static getClassDescription(className: string | null): string {
    return ClassUtils.getClassDescription(className);
  }
  
  /**
   * Get class gradient color based on class name
   */
  static getClassColor(className: string | null): string {
    return ClassUtils.getClassColor(className);
  }
  
  /**
   * Get passive skill names for a class
   */
  static getPassiveSkillNames(className: string | null): { primary: string, secondary: string } {
    return ClassUtils.getClassPassiveSkills(className);
  }
  
  /**
   * Format passive bonuses for display
   */
  static formatClassBonuses(bonuses: ClassBonusBreakdown[]): { description: string; value: string; skillName?: string }[] {
    return bonuses.map(bonus => ({
      description: bonus.description,
      value: `+${bonus.amount}`,
      skillName: bonus.skill
    }));
  }
}

// Re-export the types using 'export type' syntax for TypeScript's isolatedModules mode
export type { ClassBonus, ClassInfo, CooldownInfo, ClassBonusBreakdown };
