
/**
 * Gets the CSS class for rank color styling
 */
export function getRankColorClass(rank: string): string {
  switch (rank) {
    case 'S':
    case 'A':
      return 'bg-achievement-15 border-achievement-30';
    case 'B':
      return 'bg-valor-15 border-valor-30';
    case 'C':
    case 'D':
      return 'bg-arcane-15 border-arcane-30';
    case 'E':
    default:
      return 'bg-midnight-elevated border-divider/30';
  }
}

/**
 * Gets the CSS class for icon background
 */
export function getIconBgClass(rank: string): string {
  switch (rank) {
    case 'S':
    case 'A':
      return 'bg-achievement-15';
    case 'B':
      return 'bg-valor-15';
    case 'C':
    case 'D':
      return 'bg-arcane-15';
    case 'E':
    default:
      return 'bg-midnight-elevated';
  }
}

/**
 * Gets animation settings based on rank
 */
export function getAnimationSettings(rank: string): { delay: number; duration: number; type: string; stiffness: number } {
  switch (rank) {
    case 'S':
      return { delay: 0.15, duration: 0.7, type: 'spring', stiffness: 300 };
    case 'A':
      return { delay: 0.12, duration: 0.6, type: 'spring', stiffness: 250 };
    case 'B':
      return { delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200 };
    case 'C':
    case 'D':
      return { delay: 0.08, duration: 0.4, type: 'easeInOut', stiffness: 150 };
    case 'E':
    default:
      return { delay: 0.05, duration: 0.3, type: 'easeInOut', stiffness: 100 };
  }
}
