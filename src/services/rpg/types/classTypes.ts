
/**
 * Interface representing a class-specific bonus breakdown
 */
export interface ClassBonusBreakdown {
  skill: string;
  amount: number;
  description: string;
}

/**
 * Interface for class information
 */
export interface ClassInfo {
  className: string;
  description: string;
  icon: string;
  color: string;
  bonuses: ClassBonus[];
}

/**
 * Interface for class bonus
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
