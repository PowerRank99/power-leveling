import { LegacyClassInfo } from '@/services/rpg/types/classTypes';

interface ClassColorScheme {
  gradient: string;
  text: string;
  shadow: string;
  border: string;
  hoverBorder: string;
  accent: string;
  indicator: string;
  particleColor: string;
}

/**
 * Get class styling colors based on class name
 */
export const getClassColors = (className: string): ClassColorScheme => {
  switch(className) {
    case 'Guerreiro':
      return {
        gradient: 'bg-gradient-to-br from-red-600 via-red-500 to-red-700',
        text: 'text-red-500',
        shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.6)]',
        border: 'border-red-600/40',
        hoverBorder: 'hover:border-red-500',
        accent: 'bg-red-600/20',
        indicator: 'bg-gradient-to-r from-red-500 to-red-600',
        particleColor: '#ef4444'
      };
    case 'Monge':
      return {
        gradient: 'bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700',
        text: 'text-amber-500',
        shadow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)]',
        border: 'border-amber-500/40',
        hoverBorder: 'hover:border-amber-500',
        accent: 'bg-amber-600/20',
        indicator: 'bg-gradient-to-r from-amber-500 to-amber-600',
        particleColor: '#f59e0b'
      };
    case 'Ninja':
      return {
        gradient: 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700',
        text: 'text-emerald-500',
        shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.6)]',
        border: 'border-emerald-500/40',
        hoverBorder: 'hover:border-emerald-500',
        accent: 'bg-emerald-600/20',
        indicator: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        particleColor: '#10b981'
      };
    case 'Bruxo':
      return {
        gradient: 'bg-gradient-to-br from-violet-600 via-violet-500 to-violet-700',
        text: 'text-violet-500',
        shadow: 'shadow-[0_0_25px_rgba(139,92,246,0.6)]',
        border: 'border-violet-500/40',
        hoverBorder: 'hover:border-violet-500',
        accent: 'bg-violet-600/20',
        indicator: 'bg-gradient-to-r from-violet-500 to-violet-600',
        particleColor: '#8b5cf6'
      };
    case 'Paladino':
      return {
        gradient: 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700',
        text: 'text-blue-500',
        shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.6)]',
        border: 'border-blue-500/40',
        hoverBorder: 'hover:border-blue-500',
        accent: 'bg-blue-600/20',
        indicator: 'bg-gradient-to-r from-blue-500 to-blue-600',
        particleColor: '#3b82f6'
      };
    case 'Druida':
      return {
        gradient: 'bg-gradient-to-br from-green-600 via-green-500 to-green-700',
        text: 'text-green-500',
        shadow: 'shadow-[0_0_25px_rgba(34,197,94,0.6)]',
        border: 'border-green-500/40',
        hoverBorder: 'hover:border-green-500',
        accent: 'bg-green-600/20',
        indicator: 'bg-gradient-to-r from-green-500 to-green-600',
        particleColor: '#22c55e'
      };
    default:
      return {
        gradient: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800',
        text: 'text-gray-400',
        shadow: 'shadow-[0_0_25px_rgba(156,163,175,0.4)]',
        border: 'border-gray-500/30',
        hoverBorder: 'hover:border-gray-400',
        accent: 'bg-gray-600/20',
        indicator: 'bg-gradient-to-r from-gray-500 to-gray-600',
        particleColor: '#9ca3af'
      };
  }
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
