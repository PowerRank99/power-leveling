
/**
 * Service for determining class bonuses for different activity types
 */
export class ActivityBonusService {
  /**
   * Get class bonus for an activity type
   */
  static getClassBonus(className: string, activityType: string): number {
    // Exit early if no class or activity type
    if (!className || !activityType) return 0;
    
    // Convert activity type to lowercase for case-insensitive matching
    const activity = activityType.toLowerCase();
    
    // Match class bonuses to activities
    switch (className) {
      case 'Guerreiro':
        // 20% bonus for weight training exercises
        if (activity.includes('musculação') || activity === 'musculação') {
          return 0.2;
        }
        break;
        
      case 'Monge':
        // 20% bonus for calisthenics/bodyweight exercises
        if (activity.includes('calistenia') || activity === 'calistenia') {
          return 0.2;
        }
        break;
        
      case 'Ninja':
        // 20% bonus for cardio exercises
        if (
          activity.includes('cardio') || 
          activity === 'cardio' || 
          activity.includes('corrida') || 
          activity === 'corrida'
        ) {
          return 0.2;
        }
        break;
        
      case 'Druida':
        // 40% bonus for mobility/flexibility exercises
        if (activity.includes('mobilidade') || activity === 'mobilidade' || 
            activity.includes('flexibilidade') || activity === 'flexibilidade') {
          return 0.4;
        }
        break;
        
      case 'Paladino':
        // 40% bonus for sport activities
        if (activity.includes('esporte') || activity === 'esporte') {
          return 0.4;
        }
        break;
        
      // Add Bruxo logic here if needed
      
      default:
        return 0;
    }
    
    return 0;
  }
}
