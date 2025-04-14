
import { toast } from 'sonner';
import { ClassBonusBreakdown } from '../types/classTypes';

/**
 * XP breakdown for toast notifications
 */
export interface XPToastBreakdown {
  /** Base XP before any modifiers */
  base: number;
  
  /** Bonus from class skills */
  classBonus: number;
  
  /** Bonus from streak */
  streakBonus: number;
  
  /** Bonus from personal records */
  recordBonus: number;
  
  /** Weekly completion bonus */
  weeklyBonus: number;
  
  /** Monthly goal completion bonus */
  monthlyBonus: number;
  
  /** Detailed breakdown of all bonuses */
  bonusDetails: ClassBonusBreakdown[];
}

/**
 * Service for showing XP-related toast notifications
 */
export class XPToastService {
  /**
   * Show an XP gain toast with breakdown
   * 
   * @param amount - Total XP gained
   * @param breakdown - Optional detailed breakdown of XP components
   * @param leveledUp - Whether user leveled up from this XP gain
   */
  static showXPToast(amount: number, breakdown?: XPToastBreakdown, leveledUp: boolean = false): void {
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
