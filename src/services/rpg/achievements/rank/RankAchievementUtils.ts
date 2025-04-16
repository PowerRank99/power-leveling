
import { Achievement } from '@/types/achievementTypes';

export interface RankRequirements {
  type: 'total_count' | 'weekly_count' | 'streak' | 'class' | 'guild';
  count?: number;
  days?: number;
  guild_count?: number;
}

export const validateRankRequirements = (achievement: Achievement): boolean => {
  const requirements = achievement.requirements as RankRequirements;
  
  if (!requirements?.type) return false;
  
  switch (requirements.type) {
    case 'total_count':
    case 'weekly_count':
      return typeof requirements.count === 'number';
    case 'streak':
      return typeof requirements.days === 'number';
    case 'guild':
      return typeof requirements.guild_count === 'number';
    case 'class':
      return true;
    default:
      return false;
  }
};
