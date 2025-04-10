
import React, { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/integrations/supabase/types';
import { ClassService } from '@/services/rpg/ClassService';

export interface ProfileData {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  dailyXP: number;
  dailyXPCap: number;
  streak: number;
  achievements: {
    unlocked: number;
    total: number;
  };
  className: string;
  classDescription: string;
  lastActivity: string;
  xpGain: string;
}

interface ProfileDataProviderProps {
  profile: Profile | null;
  userClass: string | null;
  children: (data: ProfileData) => ReactNode;
}

const ProfileDataProvider: React.FC<ProfileDataProviderProps> = ({ 
  profile, 
  userClass, 
  children 
}) => {
  // Prepare RPG data for profile display
  const profileData: ProfileData = {
    level: profile?.level || 1,
    currentXP: profile?.xp || 0,
    nextLevelXP: (profile?.level || 1) * 100,
    dailyXP: 150, // Mock data - could be calculated based on today's workouts
    dailyXPCap: 300,
    streak: profile?.streak || 0,
    achievements: {
      unlocked: profile?.achievements_count || 0,
      total: 50 // Mock total achievements
    },
    className: userClass || 'Sem Classe',
    classDescription: ClassService.getClassDescription(userClass),
    lastActivity: profile?.last_workout_at ? '8h 45min' : 'Nunca',
    xpGain: '+25 EXP',
  };

  return <>{children(profileData)}</>;
};

export default ProfileDataProvider;
