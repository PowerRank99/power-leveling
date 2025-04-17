
import React, { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { ClassService } from '@/services/rpg/ClassService';
import { Profile } from './UserDataFormatter';
import { XPBonusService } from '@/services/rpg/XPBonusService';
import { RankService } from '@/services/rpg/RankService';

export interface ProfileData {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  dailyXP: number;
  dailyXPCap: number;
  streak: number;
  weeklyBonus: number;
  monthlyBonus: number;
  achievements: {
    unlocked: number;
    total: number;
    points: number;
  };
  className: string;
  classDescription: string;
  lastActivity: string;
  xpGain: string;
  rank: string;
  rankScore: number;
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
    dailyXP: profile?.daily_xp || 0,
    dailyXPCap: profile?.daily_xp_cap || 300,
    streak: profile?.streak || 0,
    weeklyBonus: 0, // Will be populated from actual database in a real implementation
    monthlyBonus: 0, // Will be populated from actual database in a real implementation
    achievements: {
      unlocked: profile?.achievements_count || 0,
      total: 50, // Mock total achievements
      points: profile?.achievement_points || 0
    },
    className: userClass || 'Sem Classe',
    classDescription: ClassService.getClassDescription(userClass),
    lastActivity: profile?.last_workout_at ? '8h 45min' : 'Nunca',
    xpGain: '+25 EXP',
    rank: profile?.rank || 'Unranked',
    rankScore: profile?.rank_progress?.rank_score || 0
  };

  return <>{children(profileData)}</>;
};

export default ProfileDataProvider;
