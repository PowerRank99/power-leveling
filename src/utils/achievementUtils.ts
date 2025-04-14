
import { AchievementRank } from '@/types/achievementTypes';

/**
 * Returns the appropriate Tailwind classes for a given achievement rank
 */
export const getRankColorClass = (rank: AchievementRank | string): string => {
  switch (rank) {
    case 'S':
      return 'border-achievement text-achievement';
    case 'A':
      return 'border-valor text-valor';
    case 'B':
      return 'border-valor-60 text-valor-60';  
    case 'C':
      return 'border-arcane text-arcane';
    case 'D':
      return 'border-arcane-60 text-arcane-60';
    case 'E':
    default:
      return 'border-text-tertiary text-text-tertiary';
  }
};

/**
 * Returns the appropriate background classes for achievement based on rank
 */
export const getRankBackgroundClass = (rank: AchievementRank | string): string => {
  switch (rank) {
    case 'S':
      return 'bg-achievement-15 border-achievement-30';
    case 'A':
      return 'bg-valor-15 border-valor-30';
    case 'B':
      return 'bg-valor-15/50 border-valor-30/50';  
    case 'C':
      return 'bg-arcane-15 border-arcane-30';
    case 'D':
      return 'bg-arcane-15/50 border-arcane-30/50';
    case 'E':
    default:
      return 'bg-midnight-card border-divider/30';
  }
};

/**
 * Get the next rank above the current one
 */
export const getNextRank = (rank: AchievementRank | string): AchievementRank | null => {
  const ranks: AchievementRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
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
    case 'S':
      return 'Rank S - Lendário';
    case 'A':
      return 'Rank A - Mestre';
    case 'B':
      return 'Rank B - Experiente';
    case 'C':
      return 'Rank C - Intermediário';
    case 'D':
      return 'Rank D - Iniciante';
    case 'E':
      return 'Rank E - Novato';
    case 'Unranked':
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
  
  if (rankScore >= 198) return 'S';
  if (rankScore >= 160) return 'A';
  if (rankScore >= 120) return 'B';
  if (rankScore >= 80) return 'C';
  if (rankScore >= 50) return 'D';
  if (rankScore >= 20) return 'E';
  
  return 'E'; // Default to rank E for new users
};

/**
 * Calculate points needed for next rank
 */
export const calculatePointsForNextRank = (currentRank: AchievementRank, level: number, achievementPoints: number): number => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 0; // Already at max rank
  
  const thresholds = {
    'S': 198,
    'A': 160,
    'B': 120,
    'C': 80,
    'D': 50,
    'E': 20,
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
    case 'S':
      return 'bg-achievement-15';
    case 'A':
      return 'bg-valor-15';
    case 'B':
      return 'bg-valor-15/50';
    case 'C':
      return 'bg-arcane-15';
    case 'D':
      return 'bg-arcane-15/50';
    case 'E':
    default:
      return 'bg-midnight-elevated';
  }
};

/**
 * Get animation settings based on rank
 */
export const getAnimationSettings = (rank: AchievementRank | string) => {
  switch (rank) {
    case 'S':
      return {
        delay: 0.1,
        duration: 0.8,
        type: 'spring',
        stiffness: 120
      };
    case 'A':
      return {
        delay: 0.09,
        duration: 0.7,
        type: 'spring',
        stiffness: 110
      };
    case 'B':
      return {
        delay: 0.08,
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      };
    case 'C':
      return {
        delay: 0.07,
        duration: 0.5,
        type: 'spring',
        stiffness: 90
      };
    case 'D':
    case 'E':
    default:
      return {
        delay: 0.05,
        duration: 0.4,
        type: 'spring',
        stiffness: 80
      };
  }
};
