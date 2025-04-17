
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RankData {
  rank: string;
  rankScore: number;
  nextRank: string | null;
  pointsToNextRank: number | null;
  totalPoints: number;
}

export interface RankThreshold {
  rank: string;
  minScore: number;
  maxScore: number | null;
  color: string;
  description: string;
}

export class RankService {
  // Rank thresholds based on rank score
  static readonly RANK_THRESHOLDS: RankThreshold[] = [
    { rank: 'Unranked', minScore: 0, maxScore: 19, color: 'text-text-secondary', description: 'Começando a jornada' },
    { rank: 'E', minScore: 20, maxScore: 49, color: 'text-arcane-60', description: 'Primeiros passos' },
    { rank: 'D', minScore: 50, maxScore: 79, color: 'text-arcane', description: 'Progresso constante' },
    { rank: 'C', minScore: 80, maxScore: 119, color: 'text-valor-60', description: 'Disciplina notável' },
    { rank: 'B', minScore: 120, maxScore: 159, color: 'text-valor', description: 'Dedicação exemplar' },
    { rank: 'A', minScore: 160, maxScore: 197, color: 'text-achievement-60', description: 'Elite do fitness' },
    { rank: 'S', minScore: 198, maxScore: null, color: 'text-achievement', description: 'Lendário' }
  ];
  
  /**
   * Calculate rank score based on level and achievement points
   */
  static calculateRankScore(level: number, achievementPoints: number): number {
    return 1.5 * level + 2 * achievementPoints;
  }
  
  /**
   * Get rank based on rank score
   */
  static getRankFromScore(rankScore: number): string {
    for (const threshold of this.RANK_THRESHOLDS) {
      if (rankScore >= threshold.minScore && 
          (threshold.maxScore === null || rankScore <= threshold.maxScore)) {
        return threshold.rank;
      }
    }
    return 'Unranked'; // Default fallback
  }
  
  /**
   * Get next rank based on current rank
   */
  static getNextRank(currentRank: string): string | null {
    const currentIndex = this.RANK_THRESHOLDS.findIndex(t => t.rank === currentRank);
    if (currentIndex === -1 || currentIndex === this.RANK_THRESHOLDS.length - 1) {
      return null; // No next rank (S rank) or rank not found
    }
    return this.RANK_THRESHOLDS[currentIndex + 1].rank;
  }
  
  /**
   * Get points needed for next rank
   */
  static getPointsToNextRank(rankScore: number, nextRank: string | null): number | null {
    if (!nextRank) return null;
    
    const nextRankThreshold = this.RANK_THRESHOLDS.find(t => t.rank === nextRank);
    if (!nextRankThreshold) return null;
    
    return nextRankThreshold.minScore - rankScore;
  }
  
  /**
   * Get rank info from profile
   */
  static async getRankData(userId: string): Promise<RankData | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('level, achievement_points, rank, rank_progress')
        .eq('id', userId)
        .single();
        
      if (error || !profile) {
        console.error('Error fetching rank data:', error);
        return null;
      }
      
      const rankProgress = profile.rank_progress || {};
      
      return {
        rank: profile.rank || 'Unranked',
        rankScore: rankProgress.rank_score || 0,
        nextRank: rankProgress.next_rank || null,
        pointsToNextRank: rankProgress.points_to_next_rank || null,
        totalPoints: profile.achievement_points || 0
      };
    } catch (error) {
      console.error('Error in getRankData:', error);
      return null;
    }
  }
  
  /**
   * Get rank threshold data for a specific rank
   */
  static getRankThreshold(rank: string): RankThreshold | null {
    return this.RANK_THRESHOLDS.find(t => t.rank === rank) || null;
  }
  
  /**
   * Get color class for a rank
   */
  static getRankColorClass(rank: string): string {
    const threshold = this.getRankThreshold(rank);
    return threshold ? threshold.color : 'text-text-secondary';
  }
  
  /**
   * Get description for a rank
   */
  static getRankDescription(rank: string): string {
    const threshold = this.getRankThreshold(rank);
    return threshold ? threshold.description : 'Começando a jornada';
  }
  
  /**
   * Get background gradient class for a rank
   */
  static getRankBackgroundClass(rank: string): string {
    switch (rank) {
      case 'S':
        return 'bg-gradient-to-br from-achievement to-achievement-60';
      case 'A':
        return 'bg-gradient-to-br from-achievement-60 to-valor';
      case 'B':
        return 'bg-gradient-to-br from-valor to-valor-60';
      case 'C':
        return 'bg-gradient-to-br from-valor-60 to-arcane';
      case 'D':
        return 'bg-gradient-to-br from-arcane to-arcane-60';
      case 'E':
        return 'bg-gradient-to-br from-arcane-60 to-arcane-30';
      default:
        return 'bg-midnight-elevated';
    }
  }
  
  /**
   * Update user rank (for testing purposes)
   */
  static async updateRank(userId: string): Promise<boolean> {
    try {
      // This function just triggers the rank calculation on the server
      const { error } = await supabase
        .rpc('recalculate_user_rank', {
          user_id: userId
        });
        
      if (error) {
        console.error('Error updating rank:', error);
        toast.error('Erro ao atualizar rank');
        return false;
      }
      
      toast.success('Rank atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Error in updateRank:', error);
      return false;
    }
  }
}
