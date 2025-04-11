
/**
 * Types for the class system
 */
export interface ClassBonus {
  bonus_type: string;
  bonus_value: number;
  description: string;
  skill_name: string;
}

export interface ClassInfo {
  class_name: string;
  bonuses: ClassBonus[];
  icon: string;
  description: string;
  color: string;
}

export interface CooldownInfo {
  on_cooldown: boolean;
  current_class: string | null;
  cooldown_ends_at: string | null;
}

export interface ClassMetadata {
  class_name: string;
  icon: string;
  description: string;
  color: string;
}

export interface PassiveSkill {
  name: string;
  description: string;
  bonus_value: number;
  bonus_type: string;
  cooldown_days?: number;
}

export interface ClassBonusBreakdown {
  skill: string;
  amount: number;
  description: string;
}
