
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';

export class AchievementIDRepairService {
  static async analyzeInconsistencies(): Promise<{
    suggestions: Array<{
      stringId: string;
      issue: string;
      suggestion: string;
    }>;
  }> {
    const suggestions: Array<{
      stringId: string;
      issue: string;
      suggestion: string;
    }> = [];
    
    // Ensure mapping service is initialized
    await AchievementIdMappingService.initialize();
    
    // Get validation results
    const validationResults = AchievementIdMappingService.validateMappings();
    
    // Analyze unmapped achievements
    for (const unmappedId of validationResults.unmapped) {
      const normalizedId = AchievementIdMappingService['normalizeId'](unmappedId);
      const similarAchievements = await this.findSimilarAchievements(normalizedId);
      
      if (similarAchievements.length > 0) {
        suggestions.push({
          stringId: unmappedId,
          issue: 'Achievement name not found in constants',
          suggestion: `Similar achievements found: ${similarAchievements.join(', ')}`
        });
      }
    }
    
    // Analyze missing database entries
    for (const missingId of validationResults.missingDatabaseEntries) {
      suggestions.push({
        stringId: missingId,
        issue: 'Missing database entry',
        suggestion: 'Create corresponding entry in achievements table'
      });
    }
    
    return { suggestions };
  }
  
  private static async findSimilarAchievements(normalizedId: string): Promise<string[]> {
    const { data: achievements } = await supabase
      .from('achievements')
      .select('name')
      .limit(5);
      
    if (!achievements) return [];
    
    return achievements
      .map(a => a.name)
      .filter(name => {
        const normalizedName = AchievementIdMappingService['normalizeId'](name);
        return this.calculateSimilarity(normalizedId, normalizedName) > 0.7;
      });
  }
  
  private static calculateSimilarity(s1: string, s2: string): number {
    if (s1.length === 0 || s2.length === 0) return 0;
    
    const longerLength = Math.max(s1.length, s2.length);
    const distance = this.levenshteinDistance(s1, s2);
    
    return (longerLength - distance) / longerLength;
  }
  
  private static levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[s1.length][s2.length];
  }
}
