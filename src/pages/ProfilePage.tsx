import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';
import { XPBonusService } from '@/services/rpg/XPBonusService';
import { useAchievementStore } from '@/stores/achievementStore';
import { Shield } from 'lucide-react';
import { RankService } from '@/services/rpg/RankService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementDebug } from '@/services/rpg/AchievementDebug';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { userClass } = useClass();
  const { rankData, fetchRankData } = useAchievementStore();
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
    
    if (user?.id) {
      fetchRankData(user.id);
      fetchClassBonuses();
      calculateBonuses();
      
      const refreshInterval = setInterval(() => {
        refreshProfile();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [userClass, user?.id, profile?.last_workout_at, fetchRankData, refreshProfile]);
  
  const handleViewAllAchievements = () => {
    navigate('/conquistas');
  };
  
  const handleClassSelection = () => {
    navigate('/selecao-de-classe');
  };
  
  const forceCheckAchievements = () => {
    if (user?.id) {
      console.log('Manual achievement check triggered');
      AchievementService.checkAchievements(user.id)
        .then(() => console.log('Manual achievement check completed'))
        .catch(error => console.error('Error in manual achievement check:', error));
    }
  };
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Perfil" 
        rightContent={<ProfileActions onSignOut={signOut} />}
      />
      
      <div className="px-4">
        <UserDataFormatter user={user} profile={profile}>
          {({ avatar, name, username, workoutsCount }) => (
            <ProfileDataProvider profile={profile} userClass={userClass}>
              {(profileData) => (
                <>
                  <ProfileHeader 
                    avatar={avatar}
                    name={name}
                    username={username}
                    level={profileData.level}
                    className={profileData.className}
                    workoutsCount={workoutsCount}
                    ranking={42}
                    currentXP={profileData.currentXP}
                    nextLevelXP={profileData.nextLevelXP}
                    rank={profileData.rank}
                    rankScore={profileData.rankScore}
                    achievementPoints={profileData.achievements.points}
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
                    onClassSelect={handleClassSelection}
                  />
                  
                  <div className="mb-5">
                    <RecentAchievementsList onViewAll={handleViewAllAchievements} />
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      className="mt-4 p-2 bg-red-600 text-white rounded opacity-50 text-xs"
                      onClick={forceCheckAchievements}
                    >
                      Debug: Force Check Achievements
                    </button>
                  )}
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
