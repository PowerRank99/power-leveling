
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClassService, ClassInfo, CooldownInfo } from '@/services/rpg/ClassService';
import { useAuth } from '@/hooks/useAuth';

interface ClassContextType {
  classes: ClassInfo[];
  userClass: string | null;
  isOnCooldown: boolean;
  cooldownEndsAt: string | null;
  cooldownText: string;
  loading: boolean;
  selectClass: (className: string) => Promise<boolean>;
  refreshClasses: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [cooldownInfo, setCooldownInfo] = useState<CooldownInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const classOptions = await ClassService.getClassOptions();
      setClasses(classOptions);
      
      if (user?.id) {
        const cooldown = await ClassService.getClassCooldown(user.id);
        setCooldownInfo(cooldown);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClasses();
  }, [user?.id, profile?.class]);
  
  const selectClass = async (className: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const success = await ClassService.selectClass(user.id, className);
    if (success) {
      await fetchClasses();
    }
    
    return success;
  };
  
  const refreshClasses = async () => {
    await fetchClasses();
  };
  
  // Compute cooldown text
  const cooldownText = ClassService.formatCooldownTime(cooldownInfo?.cooldown_ends_at || null);
  
  return (
    <ClassContext.Provider
      value={{
        classes,
        userClass: cooldownInfo?.current_class || null,
        isOnCooldown: cooldownInfo?.on_cooldown || false,
        cooldownEndsAt: cooldownInfo?.cooldown_ends_at || null,
        cooldownText,
        loading,
        selectClass,
        refreshClasses
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
