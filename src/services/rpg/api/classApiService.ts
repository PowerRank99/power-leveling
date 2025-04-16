
import { supabase } from '@/integrations/supabase/client';
import { ClassBonus, ClassInfo, CooldownInfo } from '../types/classTypes';
import { ClassUtils } from '../utils/classUtils';
import { toast } from 'sonner';
import { CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';

/**
 * Service for class API operations
 */
export class ClassApiService {
  /**
   * Get the list of available class options with metadata
   */
  static async getClassOptions(): Promise<ClassInfo[]> {
    try {
      // Get class bonuses from database
      const classes = Object.keys(ClassUtils.CLASS_METADATA);
      const classInfos: ClassInfo[] = [];
      
      for (const className of classes) {
        // Use proper typing with explicit any to handle RPC function call
        const { data, error } = await supabase
          .from('class_bonuses')
          .select('*')
          .eq('class_name', className);
        
        if (error) {
          console.error('Error fetching class bonuses:', error);
          continue;
        }
        
        // Process bonuses and add skill names
        const processedBonuses: ClassBonus[] = [];
        const upperClassName = className.toUpperCase() as keyof typeof CLASS_PASSIVE_SKILLS;
        
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            const bonus = data[i];
            let skillName = '';
            
            // Assign skill names based on bonus types and index
            if (i === 0 && upperClassName in CLASS_PASSIVE_SKILLS) {
              skillName = CLASS_PASSIVE_SKILLS[upperClassName].PRIMARY;
            } else if (i === 1 && upperClassName in CLASS_PASSIVE_SKILLS) {
              skillName = CLASS_PASSIVE_SKILLS[upperClassName].SECONDARY;
            }
            
            processedBonuses.push({
              ...bonus,
              skill_name: skillName
            });
          }
        }
        
        // Combine database bonuses with UI metadata
        classInfos.push({
          ...ClassUtils.CLASS_METADATA[className],
          bonuses: processedBonuses
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
}
