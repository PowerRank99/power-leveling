
/**
 * Interface representing a class-specific bonus breakdown
 */
export interface ClassBonusBreakdown {
  skill: string;
  amount: number;
  description: string;
}

/**
 * Interface for class information with camelCase properties
 */
export interface ClassInfo {
  className: string;
  description: string;
  icon: string;
  color: string;
  bonuses: ClassBonus[];
}

/**
 * Interface for class bonus with camelCase properties
 */
export interface ClassBonus {
  bonusType: string;
  bonusValue: number;
  description: string;
  skillName?: string;
}

/**
 * Interface for cooldown information
 */
export interface CooldownInfo {
  currentClass: string | null;
  onCooldown: boolean;
  cooldownEndsAt: string | null;
}

/**
 * Interface for class metadata
 */
export interface ClassMetadata {
  className: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Interface for formatted bonus display
 */
export interface FormattedBonus {
  description: string;
  value: string;
  skillName?: string;
}

// For backward compatibility with components that still use snake_case
export interface LegacyClassInfo {
  class_name: string;
  description: string;
  icon?: string;
  color?: string;
  bonuses: {
    bonus_type: string;
    bonus_value: number;
    description: string;
    skill_name?: string;
  }[];
}

/**
 * Type for workout difficulty levels
 */
export type WorkoutDifficulty = 'iniciante' | 'intermediario' | 'avancado';

/**
 * Enum for class names
 */
export enum ClassName {
  GUERREIRO = 'Guerreiro',
  MONGE = 'Monge',
  NINJA = 'Ninja',
  BRUXO = 'Bruxo',
  PALADINO = 'Paladino',
  // DRUIDA = 'Druida' // To be implemented in the future
}
