
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
        'Musculação': 0.2 // 20% bonus for weight training
      },
      Monge: {
        'Calistenia': 0.2 // 20% bonus for calisthenics
      },
      Ninja: {
        'Cardio': 0.2 // 20% bonus for cardio
      },
      Druida: {
        'Mobilidade & Flexibilidade': 0.4 // 40% bonus for mobility & flexibility
      },
      Paladino: {
        'Esportes': 0.4 // 40% bonus for sports
      }
    };
    
    // Check if user's class has bonuses for this activity type
    if (userClass && classActivityBonuses[userClass]) {
      const bonus = classActivityBonuses[userClass][activityType];
      return bonus || 0;
    }
    
    return 0; // No bonus
  }
}
