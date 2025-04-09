
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClassBonus {
  bonus_type: string;
  bonus_value: number;
  description: string;
}

export interface ClassInfo {
  class_name: string;
  bonuses: ClassBonus[];
  icon: string;
  description: string;
  color: string;
}

export interface CooldownInfo {
  on_cooldown: boolean;
  current_class: string | null;
  cooldown_ends_at: string | null;
}

/**
 * Service for class system operations
 */
export class ClassService {
  // Store class metadata for UI display
  static readonly CLASS_INFO: Record<string, Omit<ClassInfo, 'bonuses'>> = {
    'Guerreiro': {
      class_name: 'Guerreiro',
      icon: 'Sword',
      description: 'Especialista em Força',
      color: 'from-red-600 to-red-800'
    },
    'Monge': {
      class_name: 'Monge',
      icon: 'Dumbbell',
      description: 'Especialista em Calistenia',
      color: 'from-amber-600 to-amber-800'
    },
    'Ninja': {
      class_name: 'Ninja',
      icon: 'Wind',
      description: 'Especialista em Cardio',
      color: 'from-green-600 to-green-800'
    },
    'Bruxo': {
      class_name: 'Bruxo',
      icon: 'Sparkles',
      description: 'Especialista em Flexibilidade',
      color: 'from-purple-600 to-purple-800'
    },
    'Paladino': {
      class_name: 'Paladino',
      icon: 'Shield',
      description: 'Especialista em Esportes',
      color: 'from-blue-600 to-blue-800'
    }
  };
  
  /**
   * Get the list of available class options with metadata
   */
  static async getClassOptions(): Promise<ClassInfo[]> {
    try {
      // Get class bonuses from database
      const classes = Object.keys(this.CLASS_INFO);
      const classInfos: ClassInfo[] = [];
      
      for (const className of classes) {
        // Use proper typing with explicit any to handle RPC function call
        const { data, error } = await supabase.rpc(
          'get_class_bonuses' as any,
          { p_class_name: className }
        );
        
        if (error) {
          console.error('Error fetching class bonuses:', error);
          continue;
        }
        
        // Safe type conversion with proper checks
        const classData = data as unknown;
        let bonuses: ClassBonus[] = [];
        
        // Check if data has the expected structure
        if (classData && typeof classData === 'object' && 'bonuses' in classData) {
          // Cast to any first to access bonuses property
          bonuses = (classData as any).bonuses || [];
        }
        
        // Combine database bonuses with UI metadata
        classInfos.push({
          ...this.CLASS_INFO[className],
          bonuses
        });
      }
      
      return classInfos;
    } catch (error) {
      console.error('Error fetching class options:', error);
      return [];
    }
  }
  
  /**
   * Select a class for the current user
   */
  static async selectClass(userId: string, className: string): Promise<boolean> {
    try {
      if (!userId) {
        toast.error('Você precisa estar logado para selecionar uma classe');
        return false;
      }
      
      // Use proper typing for RPC function
      const { data, error } = await supabase.rpc(
        'select_class' as any,
        {
          p_user_id: userId,
          p_class_name: className
        }
      );
      
      if (error) {
        console.error('Error selecting class:', error);
        toast.error('Erro ao selecionar classe', { 
          description: error.message 
        });
        return false;
      }
      
      // Safely handle the response data
      const rawResult = data as unknown;
      
      // Check if the result has the expected structure
      if (!rawResult || typeof rawResult !== 'object') {
        toast.error('Erro ao selecionar classe', { 
          description: 'Resposta inválida do servidor' 
        });
        return false;
      }
      
      // Cast to any to access properties
      const typedResult = rawResult as any;
      const success = typedResult.success === true;
      
      if (!success) {
        // Extract message and cooldown info safely
        const message = typedResult.message || 'Erro desconhecido';
        
        if (message === 'Class change on cooldown') {
          // Extract cooldown date safely
          const cooldownEnds = typedResult.cooldown_ends_at ? 
            new Date(typedResult.cooldown_ends_at) : 
            new Date();
            
          const daysLeft = Math.ceil((cooldownEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          toast.error('Mudança de classe em cooldown', { 
            description: `Você poderá trocar de classe em ${daysLeft} dias` 
          });
        } else {
          toast.error('Erro ao selecionar classe', { 
            description: message || 'Erro desconhecido'
          });
        }
        return false;
      }
      
      toast.success('Classe selecionada com sucesso!', {
        description: `Você agora é um ${className}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error selecting class:', error);
      toast.error('Erro ao selecionar classe', { 
        description: error.message || 'Tente novamente mais tarde' 
      });
      return false;
    }
  }
  
  /**
   * Check if user is on cooldown for class changes
   */
  static async getClassCooldown(userId: string): Promise<CooldownInfo | null> {
    try {
      if (!userId) return null;
      
      // Use proper typing for RPC function
      const { data, error } = await supabase.rpc(
        'get_class_cooldown' as any,
        { p_user_id: userId }
      );
      
      if (error) {
        console.error('Error checking class cooldown:', error);
        return null;
      }
      
      // Safe conversion with default values
      const cooldownInfo: CooldownInfo = {
        on_cooldown: false,
        current_class: null,
        cooldown_ends_at: null
      };
      
      // Check if data has the expected structure and extract values safely
      if (data && typeof data === 'object') {
        const typedData = data as any;
        cooldownInfo.on_cooldown = typedData.on_cooldown === true;
        cooldownInfo.current_class = typedData.current_class || null;
        cooldownInfo.cooldown_ends_at = typedData.cooldown_ends_at || null;
      }
      
      return cooldownInfo;
    } catch (error) {
      console.error('Error checking class cooldown:', error);
      return null;
    }
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
    if (!className || !this.CLASS_INFO[className]) return 'Shield';
    return this.CLASS_INFO[className].icon;
  }
  
  /**
   * Get class description based on class name
   */
  static getClassDescription(className: string | null): string {
    if (!className || !this.CLASS_INFO[className]) return 'Sem classe';
    return this.CLASS_INFO[className].description;
  }
  
  /**
   * Get class gradient color based on class name
   */
  static getClassColor(className: string | null): string {
    if (!className || !this.CLASS_INFO[className]) return 'from-gray-600 to-gray-800';
    return this.CLASS_INFO[className].color;
  }
}
