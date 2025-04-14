
import React, { useState, useEffect } from 'react';
import { OptimizedProfileService } from '@/services/profile/OptimizedProfileService';
import { ProfileData } from '@/types/profile';
import { toast } from 'sonner';

interface ProfileDataProviderProps {
  userId: string;
  children: (data: ProfileData) => React.ReactNode;
}

const ProfileDataProvider: React.FC<ProfileDataProviderProps> = ({ userId, children }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    className: 'Aventureiro',
    classDescription: 'Sem especialização',
    dailyXP: 0,
    dailyXPCap: 300,
    lastActivity: 'Nenhuma atividade recente',
    xpGain: 0,
    streak: 0,
    achievementPoints: 0,
    rank: 'Unranked',
    ranking: 42,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      
      try {
        const result = await OptimizedProfileService.getUserProfileData(userId);
        
        if (!result.success || !result.data) {
          toast.error('Erro ao carregar dados do perfil');
          return;
        }

        const data = result.data;
        
        setProfileData({
          level: data.level,
          currentXP: data.xp,
          nextLevelXP: data.next_level_xp,
          className: data.class,
          classDescription: data.class_data?.description || 'Sem especialização',
          dailyXP: data.daily_xp,
          dailyXPCap: data.daily_xp_cap,
          lastActivity: data.last_workout_at ? 
            new Date(data.last_workout_at).toLocaleDateString() : 
            'Nenhuma atividade recente',
          xpGain: 0, // This will be updated through real-time updates
          streak: data.streak,
          achievementPoints: data.achievement_points,
          rank: data.rank,
          ranking: 42, // This will be implemented in a future update
        });
      } catch (error) {
        console.error('Error in ProfileDataProvider:', error);
        toast.error('Erro ao carregar dados do perfil');
      }
    };
    
    fetchProfileData();

    // Subscribe to real-time updates for XP changes
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setProfileData(prev => ({
            ...prev,
            currentXP: newData.xp || prev.currentXP,
            dailyXP: newData.daily_xp || prev.dailyXP,
            level: newData.level || prev.level,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      OptimizedProfileService.clearCache();
    };
  }, [userId]);

  return <>{children(profileData)}</>;
};

export default ProfileDataProvider;
