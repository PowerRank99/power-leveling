
import { ClassMetadata } from '../types/classTypes';
import { CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';

/**
 * Utility functions for class system
 */
export class ClassUtils {
  /**
   * Store class metadata for UI display
   */
  static readonly CLASS_METADATA: Record<string, ClassMetadata> = {
    'Guerreiro': {
      className: 'Guerreiro',
      icon: 'Sword',
      description: 'Especialista em Força',
      color: 'from-red-600 to-red-800'
    },
    'Monge': {
      className: 'Monge',
      icon: 'Dumbbell',
      description: 'Especialista em Calistenia',
      color: 'from-amber-600 to-amber-800'
    },
    'Ninja': {
      className: 'Ninja',
      icon: 'Wind',
      description: 'Especialista em Cardio',
      color: 'from-green-600 to-green-800'
    },
    'Bruxo': {
      className: 'Bruxo',
      icon: 'Sparkles',
      description: 'Mestre da Magia e Conquistas',
      color: 'from-purple-600 to-purple-800'
    },
    'Paladino': {
      className: 'Paladino',
      icon: 'Shield',
      description: 'Especialista em Esportes',
      color: 'from-blue-600 to-blue-800'
    },
    'Druida': {
      className: 'Druida',
      icon: 'Leaf',
      description: 'Mestre da Flexibilidade',
      color: 'from-emerald-600 to-emerald-800'
    }
  };
  
  /**
   * Get passive skills for a class
   */
  static getClassPassiveSkills(className: string | null): { primary: string, secondary: string } {
    if (!className) return { primary: '', secondary: '' };
    
    const upperClassName = className.toUpperCase() as keyof typeof CLASS_PASSIVE_SKILLS;
    
    if (upperClassName in CLASS_PASSIVE_SKILLS) {
      return {
        primary: CLASS_PASSIVE_SKILLS[upperClassName].PRIMARY,
        secondary: CLASS_PASSIVE_SKILLS[upperClassName].SECONDARY
      };
    }
    
    return { primary: '', secondary: '' };
  }
  
  /**
   * Format a cooldown duration into a readable string
   */
  static formatCooldownTime(cooldownEndsAt: string | null): string {
    if (!cooldownEndsAt) return 'Disponível';
    
    const cooldownDate = new Date(cooldownEndsAt);
    const now = new Date();
    
    // If cooldown has passed
    if (cooldownDate <= now) return 'Disponível';
    
    const diffMs = cooldownDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return `${diffHours}h restantes`;
    }
    
    return `${diffDays} dias restantes`;
  }
  
  /**
   * Get a class icon component based on class name
   */
  static getClassIcon(className: string | null): string {
    if (!className || !this.CLASS_METADATA[className]) return 'Shield';
    return this.CLASS_METADATA[className].icon;
  }
  
  /**
   * Get class description based on class name
   */
  static getClassDescription(className: string | null): string {
    if (!className || !this.CLASS_METADATA[className]) return 'Sem classe';
    return this.CLASS_METADATA[className].description;
  }
  
  /**
   * Get class gradient color based on class name
   */
  static getClassColor(className: string | null): string {
    if (!className || !this.CLASS_METADATA[className]) return 'from-gray-600 to-gray-800';
    return this.CLASS_METADATA[className].color;
  }
}
