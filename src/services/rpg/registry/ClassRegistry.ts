
import { PassiveSkill, ClassAbilityConfig, PassiveSkillContext, PassiveSkillResult, SpecialPassiveSkill } from '../types/PassiveSkillTypes';

/**
 * Registry for all class implementations
 * Uses a registry pattern to store and retrieve class abilities
 */
export class ClassRegistry {
  private static instance: ClassRegistry;
  private classConfigs: Map<string, ClassAbilityConfig> = new Map();
  private passiveSkills: Map<string, PassiveSkill> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ClassRegistry {
    if (!ClassRegistry.instance) {
      ClassRegistry.instance = new ClassRegistry();
    }
    return ClassRegistry.instance;
  }

  /**
   * Register a class configuration
   */
  public registerClass(config: ClassAbilityConfig): void {
    this.classConfigs.set(config.className, config);
    
    // Add both abilities to the passive skills map for easy lookup
    this.passiveSkills.set(config.primaryAbility.name, config.primaryAbility);
    this.passiveSkills.set(config.secondaryAbility.name, config.secondaryAbility);
    
    console.log(`Registered class: ${config.className} with abilities: ${config.primaryAbility.name}, ${config.secondaryAbility.name}`);
  }

  /**
   * Get a class configuration by name
   */
  public getClassConfig(className: string | null): ClassAbilityConfig | undefined {
    if (!className) return undefined;
    return this.classConfigs.get(className);
  }

  /**
   * Get all registered class configurations
   */
  public getAllClassConfigs(): ClassAbilityConfig[] {
    return Array.from(this.classConfigs.values());
  }

  /**
   * Get passive skill by name
   */
  public getPassiveSkill(skillName: string): PassiveSkill | undefined {
    return this.passiveSkills.get(skillName);
  }

  /**
   * Get all passive skills for a class
   */
  public getClassPassiveSkills(className: string | null): PassiveSkill[] {
    if (!className) return [];
    
    const config = this.classConfigs.get(className);
    if (!config) return [];
    
    return [config.primaryAbility, config.secondaryAbility];
  }

  /**
   * Calculate all applicable passive skill bonuses for a context
   */
  public calculatePassiveSkillBonuses(
    context: PassiveSkillContext
  ): {
    totalBonus: number;
    results: PassiveSkillResult[];
  } {
    let totalBonus = 0;
    const results: PassiveSkillResult[] = [];
    
    // If no class, return no bonuses
    if (!context.userClass) {
      return { totalBonus: 0, results: [] };
    }
    
    // Get class config
    const classConfig = this.getClassConfig(context.userClass);
    if (!classConfig) {
      return { totalBonus: 0, results: [] };
    }
    
    // Apply primary ability if applicable
    if (classConfig.primaryAbility.isApplicable(context)) {
      const result = classConfig.primaryAbility.calculate(context);
      totalBonus += result.bonusXP;
      results.push(result);
    }
    
    // Apply secondary ability if applicable
    if (classConfig.secondaryAbility.isApplicable(context)) {
      const result = classConfig.secondaryAbility.calculate(context);
      totalBonus += result.bonusXP;
      results.push(result);
    }
    
    return { totalBonus, results };
  }

  /**
   * Check if a passive skill is a special passive skill
   */
  public isSpecialPassiveSkill(skill: PassiveSkill): skill is SpecialPassiveSkill {
    return 'canTrigger' in skill && 'execute' in skill;
  }
}

// Export a convenience getter for the singleton instance
export const getClassRegistry = () => ClassRegistry.getInstance();
