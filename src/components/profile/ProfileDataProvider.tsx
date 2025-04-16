import React, { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { ClassService } from '@/services/rpg/ClassService';
import { Profile } from './UserDataFormatter';
import { XPBonusService } from '@/services/rpg/XPBonusService';

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
  };
  className: string;
  classDescription: string;
  lastActivity: string;
  xpGain: string;
  rank: string;
  achievementPoints: number;
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
    weeklyBonus: 0, // Will be populated from actual database in a real implementation
    monthlyBonus: 0, // Will be populated from actual database in a real implementation
    achievements: {
      unlocked: profile?.achievements_count || 0,
      total: 50 // Mock total achievements
    },
    className: userClass || 'Sem Classe',
    classDescription: ClassService.getClassDescription(userClass),
    lastActivity: profile?.last_workout_at ? '8h 45min' : 'Nunca',
    xpGain: '+25 EXP',
    rank: profile?.achievement_points 
      ? calculateRank(profile.level, profile.achievement_points)
      : 'Unranked',
    achievementPoints: profile?.achievement_points || 0,
  };

  return <>{children(profileData)}</>;
};

// Helper function to calculate rank (client-side version of the DB function)
function calculateRank(level: number, achievementPoints: number): string {
  const rankScore = (1.5 * level) + (2 * achievementPoints);
  
  if (rankScore < 20) return 'Unranked';
  if (rankScore >= 20 && rankScore < 50) return 'E';
  if (rankScore >= 50 && rankScore < 80) return 'D';
  if (rankScore >= 80 && rankScore < 120) return 'C';
  if (rankScore >= 120 && rankScore < 160) return 'B';
  if (rankScore >= 160 && rankScore < 198) return 'A';
  return 'S';
}

export default ProfileDataProvider;
