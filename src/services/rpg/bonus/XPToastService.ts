
import { toast } from 'sonner';

/**
 * Interface for XP breakdown
 */
export interface XPBreakdown {
  base: number;
  classBonus: number;
  streakBonus: number;
  recordBonus: number;
  weeklyBonus: number;
  monthlyBonus: number;
  bonusDetails: { skill: string, amount: number, description: string }[];
}

/**
 * Service for handling XP notifications
 */
export class XPToastService {
  /**
   * Show toast notification with XP breakdown
   */
  static showXPToast(totalXP: number, xpBreakdown: XPBreakdown, isPowerDay: boolean = false): void {
    console.log('[XPToastService] Showing XP breakdown:', {
      totalXP,
      breakdown: xpBreakdown,
      isPowerDay
    });
    
    let toastDesc = 'Treino completo!';
    
    const bonuses = [];
    if (xpBreakdown.base > 0) bonuses.push(`Base: ${xpBreakdown.base}`);
    if (xpBreakdown.classBonus > 0) bonuses.push(`Classe: +${xpBreakdown.classBonus}`);
    if (xpBreakdown.streakBonus > 0) bonuses.push(`Streak: +${xpBreakdown.streakBonus}`);
    if (xpBreakdown.recordBonus > 0) bonuses.push(`Recorde: +${xpBreakdown.recordBonus}`);
    if (xpBreakdown.weeklyBonus > 0) bonuses.push(`Semanal: +${xpBreakdown.weeklyBonus}`);
    if (xpBreakdown.monthlyBonus > 0) bonuses.push(`Mensal: +${xpBreakdown.monthlyBonus}`);
    
    if (bonuses.length > 0) {
      toastDesc = bonuses.join(' | ');
    }
    
    if (isPowerDay) {
      toastDesc += ' | Power Day Ativado!';
    }
    
    toast.success(`+${totalXP} XP`, {
      description: toastDesc
    });
  }
}
