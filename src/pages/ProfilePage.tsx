
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, LogOut, Dumbbell, Shield, Flame, Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileProgressSection from '@/components/profile/ProfileProgressSection';
import StreakAchievementsSection from '@/components/profile/StreakAchievementsSection';
import ClassSection from '@/components/profile/ClassSection';
import RecentAchievementsList from '@/components/profile/RecentAchievementsList';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado da sua conta.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Não foi possível fazer logout.",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = () => {
    navigate('/perfil/editar');
  };
  
  // Mock RPG data (would come from profile/state in real app)
  const rpgData = {
    level: profile?.level || 26,
    currentXP: 2450,
    nextLevelXP: 3000,
    dailyXP: 150,
    dailyXPCap: 300,
    streak: 15,
    achievements: {
      unlocked: 24,
      total: 50
    },
    className: 'Guerreiro',
    classDescription: 'Especialista em Força',
    lastActivity: '8h 45min',
    xpGain: '+25 EXP',
    bonuses: [
      {
        description: 'EXP em exercícios compostos agachamento, levantamento terra, supino',
        value: '+20%'
      },
      {
        description: 'EXP em todos os exercícios de força',
        value: '+10%'
      }
    ]
  };
  
  // Mock recent achievements
  const recentAchievements = [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: '7 Dias Seguidos'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: '50 Treinos'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5" />,
      name: 'Bloqueada',
      isLocked: true
    }
  ];
  
  // Default avatar if user doesn't have one
  const userAvatar = profile?.avatar_url || "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  const userName = profile?.name || user?.email || 'User';
  const userName1 = userName.split('@')[0] || 'user';
  const userName2 = userName1.toLowerCase().replace(/\s/g, '');
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Perfil" 
        rightContent={
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEditProfile}
              title="Editar perfil"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              title="Sair da conta"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        }
      />
      
      <div className="px-4">
        <ProfileHeader 
          avatar={userAvatar}
          name={userName}
          username={userName2}
          level={rpgData.level}
          className={rpgData.className}
          workoutsCount={profile?.workouts_count || 247}
          ranking={42}
          currentXP={rpgData.currentXP}
          nextLevelXP={rpgData.nextLevelXP}
        />
        
        <ProfileProgressSection 
          dailyXP={rpgData.dailyXP}
          dailyXPCap={rpgData.dailyXPCap}
          lastActivity={rpgData.lastActivity}
          xpGain={rpgData.xpGain}
        />
        
        <StreakAchievementsSection 
          streak={rpgData.streak}
          achievementsUnlocked={rpgData.achievements.unlocked}
          achievementsTotal={rpgData.achievements.total}
        />
        
        <ClassSection 
          className={rpgData.className}
          classDescription={rpgData.classDescription}
          icon={<Shield className="w-5 h-5 text-white" />}
          bonuses={rpgData.bonuses}
        />
        
        <div className="mb-5">
          <RecentAchievementsList achievements={recentAchievements} />
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
