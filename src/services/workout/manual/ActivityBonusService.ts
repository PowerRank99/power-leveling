
/**
 * Service for handling activity-specific bonuses
 */
export class ActivityBonusService {
  /**
   * Get class bonus for activity type
   */
  static getClassBonus(userClass: string, activityType: string): number {
    // Default activity-to-class bonus mapping
    const classActivityBonuses: Record<string, Record<string, number>> = {
      Guerreiro: {
        'strength': 0.2, // 20% bonus
        'lifting': 0.2
      },
      Monge: {
        'bodyweight': 0.2,
        'mobility': 0.15
      },
      Ninja: {
        'running': 0.2,
        'cardio': 0.2,
        'hiit': 0.2,
        'short': 0.15 // Short workouts
      },
      Bruxo: {
        'yoga': 0.4,
        'stretching': 0.4,
        'flexibility': 0.4,
        'meditation': 0.2
      },
      Paladino: {
        'sports': 0.4,
        'team': 0.3,
        'outdoor': 0.2
      }
    };
    
    // Normalize activity type to lowercase
    const normalizedActivity = activityType.toLowerCase();
    
    // Check if user's class has bonuses for this activity type
    if (userClass && classActivityBonuses[userClass]) {
      // Find any matching bonus keys
      for (const [key, bonus] of Object.entries(classActivityBonuses[userClass])) {
        if (normalizedActivity.includes(key)) {
          return bonus;
        }
      }
    }
    
    return 0; // No bonus
  }
}
