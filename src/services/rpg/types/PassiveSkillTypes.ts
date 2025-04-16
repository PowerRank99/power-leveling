
/**
 * Types for passive skills and class abilities
 */

/**
 * Passive skill application context - contains all data needed for skill calculation
 */
export interface PassiveSkillContext {
  // User information
  userId: string;
  userClass: string | null;
  streak: number;
  
  // Workout information
  workoutId?: string;
  durationMinutes: number;
  exerciseTypes: Record<string, number>; // Mapping of exercise type to count
  totalExercises: number;
  exerciseCount: number; // Count of exercises for direct XP calculations
  setCount: number; // Count of sets for direct XP calculations
  hasPR: boolean;
  isRestDay?: boolean;
  
  // XP information 
  baseXP: number;
  streakMultiplier: number;
}

/**
 * Result of passive skill application
 */
export interface PassiveSkillResult {
  bonusXP: number;
  description: string;
  skillName: string;
  multiplier?: number;
}

/**
 * Interface for passive skill calculators
 */
export interface PassiveSkill {
  name: string;
  description: string;
  userClass: string;
  
  // Check if skill is applicable in current context
  isApplicable(context: PassiveSkillContext): boolean;
  
  // Calculate bonus based on context
  calculate(context: PassiveSkillContext): PassiveSkillResult;
}

/**
 * Interface for special event skills (non-workout bonuses)
 */
export interface SpecialPassiveSkill extends PassiveSkill {
  // Check if special ability can be triggered
  canTrigger(userId: string, context: any): Promise<boolean>;
  
  // Execute the special ability
  execute(userId: string, context: any): Promise<boolean>;
}

/**
 * Class ability configuration for registration
 */
export interface ClassAbilityConfig {
  className: string;
  primaryAbility: PassiveSkill;
  secondaryAbility: PassiveSkill | SpecialPassiveSkill;
  color: string;
  icon: string;
  description: string;
}
