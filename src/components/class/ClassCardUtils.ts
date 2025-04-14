
import { LegacyClassInfo } from '@/services/rpg/types/classTypes';

/**
 * Get class styling colors based on class name
 */
export const getClassColors = (className: string) => {
  const colors = {
    'Guerreiro': {
      gradient: 'bg-gradient-to-br from-red-600/40 to-red-800/40',
      text: 'text-red-400',
      accent: 'text-red-400',
      shadow: 'shadow-red-900/30'
    },
    'Monge': {
      gradient: 'bg-gradient-to-br from-amber-600/40 to-amber-800/40',
      text: 'text-amber-400',
      accent: 'text-amber-400',
      shadow: 'shadow-amber-900/30'
    },
    'Ninja': {
      gradient: 'bg-gradient-to-br from-green-600/40 to-green-800/40',
      text: 'text-green-400',
      accent: 'text-green-400',
      shadow: 'shadow-green-900/30'
    },
    'Bruxo': {
      gradient: 'bg-gradient-to-br from-purple-600/40 to-purple-800/40',
      text: 'text-purple-400',
      accent: 'text-purple-400',
      shadow: 'shadow-purple-900/30'
    },
    'Paladino': {
      gradient: 'bg-gradient-to-br from-blue-600/40 to-blue-800/40',
      text: 'text-blue-400',
      accent: 'text-blue-400',
      shadow: 'shadow-blue-900/30'
    },
    'default': {
      gradient: 'bg-midnight-card',
      text: 'text-text-secondary',
      accent: 'text-text-secondary',
      shadow: ''
    }
  };

  return colors[className as keyof typeof colors] || colors.default;
};

/**
 * Format class bonuses for display
 */
export const formatBonuses = (bonuses: LegacyClassInfo['bonuses']) => {
  if (!bonuses || !Array.isArray(bonuses)) return [];
  
  return bonuses.map(bonus => ({
    description: bonus.description,
    value: `+${bonus.bonus_value}%`,
    skillName: bonus.skill_name
  }));
};
