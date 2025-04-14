
/**
 * Service for handling activity-specific bonuses
 */
export class ActivityBonusService {
  // Map of activity types to their normalized values
  private static readonly ACTIVITY_ALIASES: Record<string, string[]> = {
    'strength': ['lifting', 'force', 'weight', 'musculação', 'musculacao', 'força'],
    'bodyweight': ['calisthenics', 'calistenia', 'peso corporal', 'corpo livre'],
    'cardio': ['running', 'corrida', 'hiit', 'aerobic', 'aerobico'],
    'yoga': ['flexibility', 'stretching', 'flexibilidade', 'alongamento', 'meditation', 'meditação'],
    'sports': ['team', 'team_sports', 'esportes', 'swimming', 'natação', 'outdoor', 'tennis', 'basketball']
  };

  /**
   * Get class bonus for activity type
   * @param userClass The user's class
   * @param activityType The type of activity
   * @returns Bonus multiplier (e.g., 0.2 for 20% bonus)
   */
  static getClassBonus(userClass: string, activityType: string): number {
    // Default bonuses per class and activity type
    const classActivityBonuses: Record<string, Record<string, number>> = {
      Guerreiro: {
        'strength': 0.2, // 20% bonus for strength training (Força Bruta)
      },
      Monge: {
        'bodyweight': 0.2, // 20% bonus for bodyweight exercises (Força Interior)
      },
      Ninja: {
        'cardio': 0.2, // 20% bonus for cardio exercises (Forrest Gump)
      },
      Bruxo: {
        'yoga': 0.2, // 20% bonus for yoga/flexibility
      },
      Druida: {
        'yoga': 0.4, // 40% bonus for mobility & flexibility (Ritmo da Natureza)
      },
      Paladino: {
        'sports': 0.4, // 40% bonus for sports activities (Caminho do Herói)
      }
    };
    
    if (!userClass || !activityType) return 0;
    
    // Normalize the activity type by finding the primary category it belongs to
    const normalizedActivity = this.normalizeActivityType(activityType.toLowerCase());
    
    // Get the bonus for this class and normalized activity type
    if (classActivityBonuses[userClass] && classActivityBonuses[userClass][normalizedActivity]) {
      return classActivityBonuses[userClass][normalizedActivity];
    }
    
    return 0; // No bonus
  }
  
  /**
   * Normalize activity type to one of the primary categories
   */
  private static normalizeActivityType(rawActivityType: string): string {
    // First check if the activity is already a primary type
    const primaryTypes = ['strength', 'bodyweight', 'cardio', 'yoga', 'sports'];
    if (primaryTypes.includes(rawActivityType)) {
      return rawActivityType;
    }
    
    // Check if it matches any of the aliases
    for (const [primary, aliases] of Object.entries(this.ACTIVITY_ALIASES)) {
      if (aliases.some(alias => rawActivityType.includes(alias))) {
        return primary;
      }
    }
    
    // Default to returning the original type
    return rawActivityType;
  }
  
  /**
   * Get a human-readable description of the bonus for UI display
   */
  static getBonusDescription(userClass: string, activityType: string): string | null {
    const bonusPercentage = this.getClassBonus(userClass, activityType);
    if (bonusPercentage <= 0) return null;
    
    const normalizedActivity = this.normalizeActivityType(activityType.toLowerCase());
    
    // Map of activity types to readable descriptions
    const activityDescriptions: Record<string, string> = {
      'strength': 'exercícios de força',
      'bodyweight': 'exercícios com peso corporal',
      'cardio': 'exercícios cardiovasculares',
      'yoga': 'yoga e flexibilidade',
      'sports': 'atividades esportivas'
    };
    
    const activityDesc = activityDescriptions[normalizedActivity] || activityType;
    return `+${Math.round(bonusPercentage * 100)}% para ${activityDesc}`;
  }

  /**
   * Get activity-specific XP amount
   * @param activityType The type of activity
   * @returns The base XP amount for this activity type
   */
  static getActivityXP(activityType: string): number {
    // Base XP is 100 for all manual workouts
    const baseXP = 100;
    
    // For some specific activities we might want to adjust the base XP
    const activityXPModifiers: Record<string, number> = {
      // Example: 'marathon': 1.5, // 150 XP for marathon
      // 'competition': 1.2, // 120 XP for competitions
    };
    
    const normalizedActivity = this.normalizeActivityType(activityType.toLowerCase());
    const modifier = activityXPModifiers[normalizedActivity] || 1;
    
    return Math.round(baseXP * modifier);
  }
}
