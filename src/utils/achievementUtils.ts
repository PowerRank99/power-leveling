
/**
 * Gets the CSS class for rank color styling
 */
export function getRankColorClass(rank: string): string {
  switch (rank) {
    case 'S':
      return 'bg-achievement-15 border-achievement-30 text-achievement';
    case 'A':
      return 'bg-achievement-15 border-achievement-30 text-achievement';
    case 'B':
      return 'bg-valor-15 border-valor-30 text-valor';
    case 'C':
      return 'bg-arcane-15 border-arcane-30 text-arcane';
    case 'D':
      return 'bg-arcane-15 border-arcane-30 text-arcane';
    case 'E':
    default:
      return 'bg-midnight-elevated border-divider/30 text-text-tertiary';
  }
}

/**
 * Gets the CSS class for icon background
 */
export function getIconBgClass(rank: string): string {
  switch (rank) {
    case 'S':
    case 'A':
      return 'bg-achievement-15 text-achievement';
    case 'B':
      return 'bg-valor-15 text-valor';
    case 'C':
    case 'D':
      return 'bg-arcane-15 text-arcane';
    case 'E':
    default:
      return 'bg-midnight-elevated text-text-tertiary';
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

/**
 * Formats timestamp to a readable date
 */
export function formatAchievementDate(timestamp: string): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Gets a localized rank display name
 */
export function getRankDisplayName(rank: string): string {
  switch (rank) {
    case 'S': return 'Rank S - Lendário';
    case 'A': return 'Rank A - Mestre';
    case 'B': return 'Rank B - Especialista';
    case 'C': return 'Rank C - Avançado';
    case 'D': return 'Rank D - Intermediário';
    case 'E': return 'Rank E - Iniciante';
    default: return 'Sem Classificação';
  }
}

/**
 * Gets required points for the next rank
 */
export function getNextRankPoints(currentRank: string): number {
  switch (currentRank) {
    case 'Unranked': return 20; // To reach E
    case 'E': return 50; // To reach D
    case 'D': return 80; // To reach C
    case 'C': return 120; // To reach B
    case 'B': return 160; // To reach A
    case 'A': return 198; // To reach S
    case 'S': return 0; // Already at highest rank
    default: return 20;
  }
}
