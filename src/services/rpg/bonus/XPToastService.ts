
import { toast } from 'sonner';

/**
 * XP breakdown for toast notifications
 */
export interface XPBreakdown {
  base: number;
  classBonus: number;
  streakBonus: number;
  recordBonus: number;
  weeklyBonus: number;
  monthlyBonus: number;
  bonusDetails: {
    skill: string;
    amount: number;
    description: string;
  }[];
}

/**
 * Service for showing XP-related toast notifications
 */
export class XPToastService {
  /**
   * Show an XP gain toast with breakdown
   */
  static showXPToast(amount: number, breakdown?: XPBreakdown, leveledUp: boolean = false): void {
    if (amount <= 0) return;
    
    let description = `+${amount} XP`;
    
    if (breakdown?.bonusDetails && breakdown.bonusDetails.length > 0) {
      // If we have detailed breakdown, add the first bonus to the description
      const firstBonus = breakdown.bonusDetails[0];
      description += ` (${firstBonus.description})`;
    }
    
    // Show different toast based on level up status
    if (leveledUp) {
      toast.success('Nível Aumentado! 🎉', {
        description: `${description}`
      });
    } else {
      toast.success('XP Ganho!', {
        description
      });
    }
  }
}
