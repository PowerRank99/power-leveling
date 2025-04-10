
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, LogOut, Dumbbell, Shield,
  Flame, Award, Sword, Wind, Sparkles
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileProgressSection from '@/components/profile/ProfileProgressSection';
import StreakAchievementsSection from '@/components/profile/StreakAchievementsSection';
import ClassSection from '@/components/profile/ClassSection';
import RecentAchievementsList from '@/components/profile/RecentAchievementsList';
import { ClassService } from '@/services/rpg/ClassService';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { userClass } = useClass();
  const { toast } = useToast();
  const [classBonuses, setClassBonuses] = useState<{description: string; value: string}[]>([]);
  
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
    
    fetchClassBonuses();
  }, [userClass]);
  
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
  
  // Get class icon based on selected class
  const getClassIcon = () => {
    if (!userClass) return <Shield className="w-5 h-5 text-white" />;
    
    switch (userClass) {
      case 'Guerreiro': return <Sword className="w-5 h-5 text-white" />;
      case 'Monge': return <Dumbbell className="w-5 h-5 text-white" />;
      case 'Ninja': return <Wind className="w-5 h-5 text-white" />;
      case 'Bruxo': return <Sparkles className="w-5 h-5 text-white" />;
      case 'Paladino': return <Shield className="w-5 h-5 text-white" />;
      default: return <Shield className="w-5 h-5 text-white" />;
    }
  };
  
  // RPG data 
  const rpgData = {
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
          workoutsCount={profile?.workouts_count || 0}
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
          icon={getClassIcon()}
          bonuses={classBonuses}
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
