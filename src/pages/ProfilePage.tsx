
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileProgressSection from '@/components/profile/ProfileProgressSection';
import ProfileDataProvider from '@/components/profile/ProfileDataProvider';
import StreakAchievementsSection from '@/components/profile/StreakAchievementsSection';
import RecentAchievementsList from '@/components/profile/RecentAchievementsList';
import { getMockAchievements } from '@/components/profile/MockAchievements';
import UserDataFormatter from '@/components/profile/UserDataFormatter';
import ProfileActions from '@/components/profile/ProfileActions';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import ClassCard from '@/components/profile/ClassCard';
import AchievementPopup from '@/components/profile/AchievementPopup';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ProfilePage = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const mockAchievements = getMockAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-midnight-deep">
        <LoadingSpinner size="lg" message="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-base pb-20">
      {/* Profile Header with Actions */}
      <div className="relative">
        <UserDataFormatter user={user} profile={profile}>
          {(userData) => (
            <ProfileDataProvider userId={user?.id || ''}>
              {(profileData) => (
                <>
                  <div className="flex justify-end absolute right-4 top-4 z-10">
                    <ProfileActions onSignOut={signOut} />
                  </div>
                  
                  <ProfileHeader
                    avatar={userData.avatar}
                    name={userData.name}
                    username={userData.username}
                    level={profileData.level}
                    className={profileData.className}
                    workoutsCount={userData.workoutsCount}
                    ranking={profileData.ranking}
                    currentXP={profileData.currentXP}
                    nextLevelXP={profileData.nextLevelXP}
                    rank={profileData.rank}
                    achievementPoints={profileData.achievementPoints}
                  />
                  
                  <div className="px-4">
                    {/* Progress Section */}
                    <ProfileProgressSection
                      dailyXP={profileData.dailyXP}
                      dailyXPCap={profileData.dailyXPCap}
                      lastActivity={profileData.lastActivity}
                      xpGain={profileData.xpGain}
                      streak={profileData.streak}
                    />
                    
                    {/* Streak and Achievements Section */}
                    <StreakAchievementsSection
                      streak={profileData.streak}
                      achievementsUnlocked={profileData.achievementPoints}
                      achievementsTotal={50} // Example total
                    />
                    
                    {/* Class Card */}
                    <ClassCard
                      className={profileData.className}
                      description={profileData.classDescription}
                      bonuses={[
                        { description: "Bônus principal", value: "+20% XP em treinos de força" },
                        { description: "Bônus secundário", value: "+10% XP em dias de recorde" }
                      ]}
                      showAvatar={true}
                    />
                    
                    {/* Recent Achievements */}
                    <RecentAchievementsList
                      achievements={mockAchievements.slice(0, 4)}
                    />
                  </div>
                </>
              )}
            </ProfileDataProvider>
          )}
        </UserDataFormatter>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavBar />
      
      {/* Achievement Popup System */}
      <AchievementPopup />
    </div>
  );
};

export default ProfilePage;
