
/**
 * Utility functions for achievement styling and animation
 */

/**
 * Get the background color class for rank badges and headers
 */
export function getRankColorClass(rank: string): string {
  switch (rank) {
    case 'S': return 'bg-achievement-15 border-b border-achievement-30';
    case 'A': return 'bg-achievement-15 border-b border-achievement-30';
    case 'B': return 'bg-valor-15 border-b border-valor-30';
    case 'C': 
    case 'D':
    case 'E': return 'bg-arcane-15 border-b border-arcane-30';
    default: return 'bg-midnight-elevated border-b border-divider/30';
  }
}

/**
 * Get the background class for achievement icons
 */
export function getIconBgClass(rank: string): string {
  switch (rank) {
    case 'S': 
    case 'A': return 'bg-achievement-15';
    case 'B': return 'bg-valor-15';
    default: return 'bg-arcane-15';
  }
}

/**
 * Get animation settings based on rank
 */
export function getAnimationSettings(rank: string): {
  delay: number;
  duration: number;
  type: string;
  stiffness: number;
} {
  switch (rank) {
    case 'S': return { delay: 0.1, duration: 0.6, type: 'spring', stiffness: 200 };
    case 'A': return { delay: 0.08, duration: 0.5, type: 'spring', stiffness: 150 };
    case 'B': return { delay: 0.06, duration: 0.4, type: 'spring', stiffness: 120 };
    default: return { delay: 0.05, duration: 0.3, type: 'spring', stiffness: 100 };
  }
}
