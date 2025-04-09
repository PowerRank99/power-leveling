
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RPGClassName, RPGClass, ClassBonus } from '@/types/rpgTypes';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Define available classes with their descriptions
const RPG_CLASSES: Record<RPGClassName, RPGClass> = {
  warrior: {
    name: 'warrior',
    title: 'Guerreiro',
    description: 'Especialista em treinos de força, ganha bônus em exercícios de levantamento de peso.',
    primaryBonus: '+15% XP em exercícios de força',
    secondaryBonus: '+10% de resistência',
    iconName: 'swords'
  },
  rogue: {
    name: 'rogue',
    title: 'Ladino',
    description: 'Focado em agilidade e HIIT, recebe bônus por treinos curtos e intensos.',
    primaryBonus: '+20% XP para treinos rápidos (< 30 min)',
    secondaryBonus: '+15% de recuperação',
    iconName: 'running'
  },
  mage: {
    name: 'mage',
    title: 'Mago',
    description: 'Especialista em progressão estratégica, ganha bônus por manter sequências.',
    primaryBonus: '+25% XP de bônus de sequência',
    secondaryBonus: '+10% em todos os treinos',
    iconName: 'sparkles'
  },
  ranger: {
    name: 'ranger',
    title: 'Arqueiro',
    description: 'Especialista em cardio e resistência, ganha bônus em exercícios aeróbicos.',
    primaryBonus: '+20% XP em exercícios cardio',
    secondaryBonus: '+10% de resistência',
    iconName: 'heart'
  },
  cleric: {
    name: 'cleric',
    title: 'Clérigo',
    description: 'Focado em recuperação e bem-estar, recebe bônus por treinos equilibrados.',
    primaryBonus: '+15% XP para treinos completos',
    secondaryBonus: '+20% de tempo de recuperação',
    iconName: 'shield'
  }
};

export const useRPGClass = () => {
  const { user, profile } = useAuth();
  const [currentClass, setCurrentClass] = useState<RPGClassName | null>(null);
  const [bonuses, setBonuses] = useState<ClassBonus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load current class from profile
  useEffect(() => {
    if (profile?.class) {
      setCurrentClass(profile.class as RPGClassName);
    }
  }, [profile]);
  
  // Load class bonuses
  useEffect(() => {
    const fetchBonuses = async () => {
      if (!currentClass) return;
      
      try {
        const { data, error } = await supabase
          .from('class_bonuses')
          .select('*')
          .eq('class_name', currentClass);
          
        if (error) throw error;
        
        if (data) {
          setBonuses(data.map(bonus => ({
            id: bonus.id,
            className: bonus.class_name as RPGClassName,
            bonusType: bonus.bonus_type as any,
            bonusValue: bonus.bonus_value,
            description: bonus.description
          })));
        }
      } catch (error) {
        console.error('Error loading class bonuses:', error);
      }
    };
    
    fetchBonuses();
  }, [currentClass]);
  
  /**
   * Update user's class selection
   */
  const selectClass = useCallback(async (className: RPGClassName) => {
    if (!user) {
      toast.error('Erro', { description: 'Você precisa estar logado para selecionar uma classe.' });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          class: className,
          class_selected_at: now,
          updated_at: now
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setCurrentClass(className);
      
      toast.success(`Classe selecionada: ${RPG_CLASSES[className].title}`, {
        description: `Você agora receberá os bônus de ${RPG_CLASSES[className].title}.`
      });
      
      return true;
    } catch (error) {
      console.error('Error selecting class:', error);
      toast.error('Erro ao selecionar classe', {
        description: 'Não foi possível atualizar sua classe.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  /**
   * Get details for a specific class
   */
  const getClassDetails = useCallback((className: RPGClassName): RPGClass => {
    return RPG_CLASSES[className];
  }, []);
  
  /**
   * Get all available classes
   */
  const getAllClasses = useCallback((): RPGClass[] => {
    return Object.values(RPG_CLASSES);
  }, []);
  
  /**
   * Get bonuses that apply to a specific workout type
   */
  const getPassiveBonuses = useCallback((workoutType: string): ClassBonus[] => {
    if (!currentClass) return [];
    
    return bonuses.filter(bonus => {
      // Apply general XP bonuses
      if (bonus.bonusType === 'xp') return true;
      
      // Apply type-specific bonuses
      if (workoutType && bonus.bonusType === workoutType) return true;
      
      return false;
    });
  }, [currentClass, bonuses]);
  
  return {
    currentClass,
    selectClass,
    getClassDetails,
    getAllClasses,
    getPassiveBonuses,
    isLoading,
    RPG_CLASSES
  };
};
