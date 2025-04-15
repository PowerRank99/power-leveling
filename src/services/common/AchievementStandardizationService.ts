
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { AchievementDefinition } from '@/constants/achievements/AchievementSchema';
import { ACHIEVEMENTS } from '@/constants/achievements';

export class AchievementStandardizationService {
  /**
   * Validates and standardizes achievement IDs across the application
   */
  static async validateAndStandardize(): Promise<{
    valid: string[];
    invalid: string[];
    missing: string[];
    suggestions: Array<{
      id: string;
      issue: string;
      suggestion: string;
    }>;
  }> {
    const constantIds = this.getAllConstantIds();
    const databaseIds = await this.getDatabaseIds();
    
    const valid: string[] = [];
    const invalid: string[] = [];
    const missing: string[] = [];
    const suggestions: Array<{ id: string; issue: string; suggestion: string; }> = [];

    // Check constant IDs against database
    for (const id of constantIds) {
      const normalizedId = this.normalizeId(id);
      
      if (databaseIds.has(normalizedId)) {
        valid.push(id);
      } else {
        invalid.push(id);
        suggestions.push({
          id,
          issue: 'Missing database entry',
          suggestion: `Create database entry with ID: ${normalizedId}`
        });
      }
    }

    // Check database IDs against constants
    for (const dbId of databaseIds) {
      if (!constantIds.some(id => this.normalizeId(id) === dbId)) {
        missing.push(dbId);
        suggestions.push({
          id: dbId,
          issue: 'Missing constant definition',
          suggestion: `Add constant definition for ID: ${dbId}`
        });
      }
    }

    return { valid, invalid, missing, suggestions };
  }

  private static normalizeId(id: string): string {
    return id.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-');
  }

  private static getAllConstantIds(): string[] {
    const ids: string[] = [];
    
    Object.values(ACHIEVEMENTS).forEach(category => {
      Object.values(category).forEach(achievement => {
        if (typeof achievement === 'string') {
          ids.push(achievement);
        } else if (achievement && typeof achievement === 'object' && 'id' in achievement) {
          ids.push(achievement.id);
        }
      });
    });
    
    return ids;
  }

  private static async getDatabaseIds(): Promise<Set<string>> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id');
      
    if (error) {
      console.error('Failed to load database achievements:', error);
      return new Set();
    }
    
    return new Set(achievements.map(a => a.id));
  }

  static getConstantDefinition(id: string): AchievementDefinition | undefined {
    for (const category of Object.values(ACHIEVEMENTS)) {
      for (const achievement of Object.values(category)) {
        if (
          (typeof achievement === 'string' && achievement === id) ||
          (achievement && typeof achievement === 'object' && 'id' in achievement && achievement.id === id)
        ) {
          return achievement as AchievementDefinition;
        }
      }
    }
    return undefined;
  }
}

