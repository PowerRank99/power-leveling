
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
  // Calculate XP needed for next level (100 * current level)
  const calculateNextLevelXP = (level: number) => {
    if (level >= 99) {
      return Infinity; // Maximum level reached
    }
    return level * 100; // Each level requires level * 100 XP
  };

  // Prepare RPG data for profile display
  const rankProgress = profile?.rank_progress ? 
    (typeof profile.rank_progress === 'string' ? 
      JSON.parse(profile.rank_progress) : 
      profile.rank_progress as Record<string, any>)
    : { rank_score: 0 };

  const level = profile?.level || 1;
  const currentXP = profile?.xp || 0;
  const nextLevelXP = calculateNextLevelXP(level);

  const profileData: ProfileData = {
    level,
    currentXP,
    nextLevelXP,
    dailyXP: profile?.daily_xp || 0,
    dailyXPCap: profile?.daily_xp_cap || 300,
    streak: profile?.streak || 0,
    weeklyBonus: 0,
    monthlyBonus: 0,
    achievements: {
      unlocked: profile?.achievements_count || 0,
      total: 50,
      points: profile?.achievement_points || 0
    },
    className: userClass || 'Sem Classe',
    classDescription: ClassService.getClassDescription(userClass),
    lastActivity: profile?.last_workout_at ? '8h 45min' : 'Nunca',
    xpGain: '+25 EXP',
    rank: profile?.rank || 'Unranked',
    rankScore: typeof rankProgress.rank_score === 'number' ? rankProgress.rank_score : 0
  };

  return <>{children(profileData)}</>;
};

export default ProfileDataProvider;
