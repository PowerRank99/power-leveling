
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileProgressSection from '@/components/profile/ProfileProgressSection';
import ClassSection from '@/components/profile/ClassSection';
import RecentAchievementsList from '@/components/profile/RecentAchievementsList';
import ProfileActions from '@/components/profile/ProfileActions';
import ClassIconSelector from '@/components/profile/ClassIconSelector';
import ProfileDataProvider from '@/components/profile/ProfileDataProvider';
import UserDataFormatter from '@/components/profile/UserDataFormatter';
import { getMockAchievements } from '@/components/profile/MockAchievements';
import { supabase } from '@/integrations/supabase/client';
import { XPBonusService } from '@/services/rpg/XPBonusService';

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const { userClass } = useClass();
  const [classBonuses, setClassBonuses] = useState<{description: string; value: string}[]>([]);
  const [weeklyBonus, setWeeklyBonus] = useState(0);
  const [monthlyBonus, setMonthlyBonus] = useState(0);
  
  useEffect(() => {
    const fetchClassBonuses = async () => {
      if (userClass) {
        try {
          const { data } = await supabase
            .from('class_bonuses')
            .select('description, bonus_value')
            .eq('class_name', userClass);
            
          if (data) {
            setClassBonuses(data.map(bonus => ({
              description: bonus.description,
              value: `+${Math.round(bonus.bonus_value * 100)}%`
            })));
          }
        } catch (error) {
          console.error('Error fetching class bonuses:', error);
        }
      }
    };
    
    const calculateBonuses = async () => {
      if (user?.id && profile?.last_workout_at) {
        setWeeklyBonus(XPBonusService.WEEKLY_COMPLETION_BONUS);
        setMonthlyBonus(0);
      }
    };
    
    fetchClassBonuses();
    calculateBonuses();
  }, [userClass, user?.id, profile?.last_workout_at]);
  
  const recentAchievements = getMockAchievements();
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Perfil" 
        rightContent={<ProfileActions onSignOut={signOut} />}
      />
      
      <div className="px-4">
        <UserDataFormatter user={user} profile={profile}>
          {({ avatar, name, username, workoutsCount }) => (
            <ProfileDataProvider userId={user?.id || ""}>
              {(profileData) => (
                <>
                  <ProfileHeader 
                    avatar={avatar}
                    name={name}
                    username={username}
                    level={profileData.level}
                    className={profileData.className}
                    workoutsCount={workoutsCount}
                    ranking={profileData.ranking?.toString() || '42'}
                    currentXP={profileData.currentXP}
                    nextLevelXP={profileData.nextLevelXP}
                    rank={profileData.rank}
                    achievementPoints={profileData.achievementPoints}
                  />
                  
                  <ProfileProgressSection 
                    dailyXP={profileData.dailyXP}
                    dailyXPCap={profileData.dailyXPCap}
                    lastActivity={profileData.lastActivity}
                    xpGain={profileData.xpGain}
                    streak={profileData.streak}
                    weeklyBonus={weeklyBonus}
                    monthlyBonus={monthlyBonus}
                  />
                  
                  <ClassSection 
                    className={profileData.className}
                    classDescription={profileData.classDescription}
                    icon={<ClassIconSelector className={profileData.className} />}
                    bonuses={classBonuses}
                  />
                  
                  <div className="mb-5">
                    <RecentAchievementsList achievements={recentAchievements} />
                  </div>
                </>
              )}
            </ProfileDataProvider>
          )}
        </UserDataFormatter>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
