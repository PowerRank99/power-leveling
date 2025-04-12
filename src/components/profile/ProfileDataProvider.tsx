
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { XPBonusService } from '@/services/rpg/XPBonusService';

export interface ProfileData {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  className: string;
  classDescription: string;
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string;
  xpGain: number;
  streak: number;
  achievementPoints: number;
  rank: string;
  ranking: number;
}

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
      try {
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('level, xp, class, daily_xp, daily_xp_cap, last_workout_at, streak, achievements_count, rank, achievement_points')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile data:', error);
          return;
        }
        
        if (data) {
          // Calculate next level XP
          const nextLevel = data.level ? data.level + 1 : 2;
          const nextLevelXP = XPBonusService.getXPForLevel(nextLevel);
          
          // Determine last activity
          const lastActivity = data.last_workout_at
            ? new Date(data.last_workout_at).toLocaleDateString()
            : 'Nenhuma atividade recente';
          
          // Get class description - note that we're checking for the 'class' field, not 'class_name'
          let classDescription = 'Sem especialização';
          
          if (data.class) {
            const { data: classData, error: classError } = await supabase
              .from('class_bonuses')
              .select('description')
              .eq('class_name', data.class)
              .single();
            
            if (!classError && classData) {
              classDescription = classData.description;
            } else if (classError) {
              console.error('Error fetching class description:', classError);
            }
          }
          
          setProfileData({
            level: data.level || 1,
            currentXP: data.xp || 0,
            nextLevelXP: nextLevelXP,
            className: data.class || 'Aventureiro',
            classDescription: classDescription,
            dailyXP: data.daily_xp || 0,
            dailyXPCap: data.daily_xp_cap || 300,
            lastActivity: lastActivity,
            xpGain: 0,
            streak: data.streak || 0,
            achievementPoints: data.achievement_points || 0,
            rank: data.rank || 'Unranked',
            ranking: 42, // Default value as a number
          });
        }
      } catch (error) {
        console.error('Error in ProfileDataProvider:', error);
      }
    };
    
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  return <>{children(profileData)}</>;
};

export default ProfileDataProvider;
