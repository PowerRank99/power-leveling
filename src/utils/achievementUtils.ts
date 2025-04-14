
import { AchievementRank } from '@/types/achievementTypes';

/**
 * Returns the appropriate Tailwind classes for a given achievement rank
 */
export const getRankColorClass = (rank: AchievementRank | string): string => {
  switch (rank) {
    case AchievementRank.S:
      return 'border-achievement text-achievement';
    case AchievementRank.A:
      return 'border-valor text-valor';
    case AchievementRank.B:
      return 'border-valor-60 text-valor-60';  
    case AchievementRank.C:
      return 'border-arcane text-arcane';
    case AchievementRank.D:
      return 'border-arcane-60 text-arcane-60';
    case AchievementRank.E:
    default:
      return 'border-text-tertiary text-text-tertiary';
  }
};

/**
 * Returns the appropriate background classes for achievement based on rank
 */
export const getRankBackgroundClass = (rank: AchievementRank | string): string => {
  switch (rank) {
    case AchievementRank.S:
      return 'bg-achievement-15 border-achievement-30';
    case AchievementRank.A:
      return 'bg-valor-15 border-valor-30';
    case AchievementRank.B:
      return 'bg-valor-15/50 border-valor-30/50';  
    case AchievementRank.C:
      return 'bg-arcane-15 border-arcane-30';
    case AchievementRank.D:
      return 'bg-arcane-15/50 border-arcane-30/50';
    case AchievementRank.E:
    default:
      return 'bg-midnight-card border-divider/30';
  }
};

/**
 * Get the next rank above the current one
 */
export const getNextRank = (rank: AchievementRank | string): AchievementRank | null => {
  const ranks: AchievementRank[] = [
    AchievementRank.E, 
    AchievementRank.D, 
    AchievementRank.C, 
    AchievementRank.B, 
    AchievementRank.A, 
    AchievementRank.S
  ];
  const currentIndex = ranks.indexOf(rank as AchievementRank);
  
  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return null; // Invalid rank or already at the highest rank
  }
  
  return ranks[currentIndex + 1];
};

/**
 * Get the display name for a rank
 */
export const getRankDisplayName = (rank: AchievementRank | string): string => {
  switch (rank) {
    case AchievementRank.S:
      return 'Rank S - Lendário';
    case AchievementRank.A:
      return 'Rank A - Mestre';
    case AchievementRank.B:
      return 'Rank B - Experiente';
    case AchievementRank.C:
      return 'Rank C - Intermediário';
    case AchievementRank.D:
      return 'Rank D - Iniciante';
    case AchievementRank.E:
      return 'Rank E - Novato';
    case AchievementRank.UNRANKED:
    default:
      return 'Sem Rank';
  }
};

/**
 * Calculate the user's rank based on level and achievement points
 * Formula: Rank Score = 1.5 × Level + 2 × (Achievement Points)
 */
export const calculateUserRank = (level: number, achievementPoints: number): AchievementRank => {
  const rankScore = 1.5 * level + 2 * achievementPoints;
  
  if (rankScore >= 198) return AchievementRank.S;
  if (rankScore >= 160) return AchievementRank.A;
  if (rankScore >= 120) return AchievementRank.B;
  if (rankScore >= 80) return AchievementRank.C;
  if (rankScore >= 50) return AchievementRank.D;
  if (rankScore >= 20) return AchievementRank.E;
  
  return AchievementRank.E; // Default to rank E for new users
};

/**
 * Calculate points needed for next rank
 */
export const calculatePointsForNextRank = (currentRank: AchievementRank, level: number, achievementPoints: number): number => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 0; // Already at max rank
  
  const thresholds = {
    [AchievementRank.S]: 198,
    [AchievementRank.A]: 160,
    [AchievementRank.B]: 120,
    [AchievementRank.C]: 80,
    [AchievementRank.D]: 50,
    [AchievementRank.E]: 20,
  };
  
  const currentScore = 1.5 * level + 2 * achievementPoints;
  const neededScore = thresholds[nextRank];
  const pointsNeeded = Math.ceil((neededScore - currentScore) / 2);
  
  return Math.max(0, pointsNeeded);
};

/**
 * Get icon background class based on rank
 */
export const getIconBgClass = (rank: AchievementRank | string): string => {
  switch (rank) {
    case AchievementRank.S:
      return 'bg-achievement-15';
    case AchievementRank.A:
      return 'bg-valor-15';
    case AchievementRank.B:
      return 'bg-valor-15/50';
    case AchievementRank.C:
      return 'bg-arcane-15';
    case AchievementRank.D:
      return 'bg-arcane-15/50';
    case AchievementRank.E:
    default:
      return 'bg-midnight-elevated';
  }
};

/**
 * Get animation settings based on rank
 */
export const getAnimationSettings = (rank: AchievementRank | string) => {
  switch (rank) {
    case AchievementRank.S:
      return {
        delay: 0.1,
        duration: 0.8,
        type: 'spring',
        stiffness: 120
      };
    case AchievementRank.A:
      return {
        delay: 0.09,
        duration: 0.7,
        type: 'spring',
        stiffness: 110
      };
    case AchievementRank.B:
      return {
        delay: 0.08,
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      };
    case AchievementRank.C:
      return {
        delay: 0.07,
        duration: 0.5,
        type: 'spring',
        stiffness: 90
      };
    case AchievementRank.D:
    case AchievementRank.E:
    default:
      return {
        delay: 0.05,
        duration: 0.4,
        type: 'spring',
        stiffness: 80
      };
  }
};
