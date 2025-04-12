
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  achievementPoints: number;
  achievementsCount: number;
  workoutsCount: number;
  streak: number;
  lastWorkout: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  rank: string;
}

interface ProfileContextProps {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
}

interface ProfileData {
  level: number;
  xp: number;
  className: string;
  classDescription: string;
  rank: string;
  achievementPoints: number;
  workoutsCount: number;
  currentXP: number;
  nextLevelXP: number;
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string | null;
  xpGain: number;
  streak: number;
}

interface ProfileDataProviderProps {
  userId: string;
  children: (profileData: ProfileData) => ReactNode;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileDataProvider');
  }
  return context;
};

const ProfileDataProvider: React.FC<ProfileDataProviderProps> = ({ 
  children,
  userId
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          setError(error.message);
        } else {
          // Calculate rank based on points
          const rank = calculateProfileRank(data?.achievements_count || 0);

          setProfile({
            id: data.id,
            username: data.name, // Using name instead of username
            fullName: data.name, // Using name instead of full_name
            avatarUrl: data.avatar_url,
            xp: data.xp || 0,
            level: data.level || 1,
            achievementPoints: data.achievements_count || 0, // Using achievements_count instead of achievement_points
            achievementsCount: data.achievements_count || 0,
            workoutsCount: data.workouts_count || 0,
            streak: data.streak || 0,
            lastWorkout: data.last_workout_at, // Using last_workout_at instead of last_workout
            isPremium: false, // Hardcoded since is_premium doesn't exist
            premiumExpiresAt: null, // Hardcoded since premium_expires_at doesn't exist
            rank: rank
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const refetchProfile = async () => {
    await fetchProfileData(userId);
  };

  const fetchProfileData = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        // Calculate rank based on points
        const rank = calculateProfileRank(data?.achievements_count || 0);

        setProfile({
          id: data.id,
          username: data.name, // Using name instead of username
          fullName: data.name, // Using name instead of full_name
          avatarUrl: data.avatar_url,
          xp: data.xp || 0,
          level: data.level || 1,
          achievementPoints: data.achievements_count || 0, // Using achievements_count instead of achievement_points
          achievementsCount: data.achievements_count || 0,
          workoutsCount: data.workouts_count || 0,
          streak: data.streak || 0,
          lastWorkout: data.last_workout_at, // Using last_workout_at instead of last_workout
          isPremium: false, // Hardcoded since is_premium doesn't exist
          premiumExpiresAt: null, // Hardcoded since premium_expires_at doesn't exist
          rank: rank
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate rank
  const calculateProfileRank = (points: number): string => {
    if (points >= 1000) return 'S';
    if (points >= 500) return 'A';
    if (points >= 250) return 'B';
    if (points >= 100) return 'C';
    if (points >= 50) return 'D';
    if (points >= 10) return 'E';
    return 'Unranked';
  };

  // Prepare the profileData object to be passed to children
  const profileData: ProfileData = {
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    className: profile?.username || 'Novato',
    classDescription: 'Game description',
    rank: profile?.rank || 'Unranked',
    achievementPoints: profile?.achievementPoints || 0,
    workoutsCount: profile?.workoutsCount || 0,
    currentXP: profile?.xp || 0,
    nextLevelXP: (profile?.level || 1) * 100,
    dailyXP: 0, // Placeholder value
    dailyXPCap: 300,
    lastActivity: profile?.lastWorkout,
    xpGain: 0, // Placeholder value
    streak: profile?.streak || 0
  };

  // Convert the functional children to ReactNode
  const renderedChildren = children(profileData);

  // Value to be provided by the context
  const value: ProfileContextProps = {
    profile,
    isLoading,
    error,
    refetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {renderedChildren}
    </ProfileContext.Provider>
  );
};

export default ProfileDataProvider;
