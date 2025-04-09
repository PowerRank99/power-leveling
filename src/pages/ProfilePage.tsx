
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Medal, Dumbbell, Award, LogOut, Edit3, Swords, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Achievement from '@/components/profile/Achievement';
import ProgressBar from '@/components/profile/ProgressBar';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import Trophy from '@/components/icons/Trophy';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getUserAchievements } from '@/services/rpg/AchievementService';
import { getXPForNextLevel } from '@/services/rpg/XPService';
import { getFormattedLastWorkout } from '@/services/rpg/StreakService';
import { UserAchievement } from '@/types/rpgTypes';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  
  // Load user achievements
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return;
      
      setIsLoadingAchievements(true);
      try {
        const achievements = await getUserAchievements(user.id);
        setUserAchievements(achievements);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setIsLoadingAchievements(false);
      }
    };
    
    loadAchievements();
  }, [user]);
  
  // Calculate XP progress for next level
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const nextLevelXP = getXPForNextLevel(currentXP);
  const xpForCurrentLevel = getXPForNextLevel(currentXP - 1);
  const xpProgress = nextLevelXP > xpForCurrentLevel 
    ? Math.round(((currentXP - xpForCurrentLevel) / (nextLevelXP - xpForCurrentLevel)) * 100) 
    : 100;
  
  // Format streak and last workout time
  const formattedLastWorkout = profile?.last_workout_at 
    ? getFormattedLastWorkout(profile.last_workout_at)
    : 'Nenhum treino recente';
  
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
  
  // Default avatar if user doesn't have one
  const userAvatar = profile?.avatar_url || "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
  // Format achievement dates
  const formatAchievementDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'Data desconhecida';
    }
  };
  
  // Goals data
  const goals = [
    {
      id: "1",
      label: "Meta de Agachamento",
      current: 120,
      target: 150,
      colorClass: "bg-fitblue"
    },
    {
      id: "2",
      label: "Treinos Semanais",
      current: 3,
      target: 5,
      colorClass: "bg-fitgreen"
    }
  ];

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
      
      {/* User Profile Header with RPG information */}
      <div className="bg-white p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-lg overflow-hidden mb-2">
          <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
        
        <h2 className="text-xl font-bold">{profile?.name || user?.email}</h2>
        <p className="text-gray-600">Nível {profile?.level || 1} - {profile?.title || "Novato"}</p>
        
        {/* Class badge if selected */}
        {profile?.class && (
          <div className="mt-1 py-1 px-3 bg-fitblue/10 text-fitblue rounded-full text-sm font-medium">
            {profile.class.charAt(0).toUpperCase() + profile.class.slice(1)}
          </div>
        )}
        
        {/* XP Progress */}
        <div className="w-full mt-4">
          <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
            <div 
              className="h-full bg-fitblue" 
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{currentXP}/{nextLevelXP} XP para o próximo nível</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex w-full justify-between mt-6">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Dumbbell className="w-6 h-6 text-fitblue mb-1" />
              <span className="text-2xl font-bold">{profile?.workouts_count || 0}</span>
              <span className="text-xs text-gray-500">Treinos</span>
            </div>
          </div>
          
          <div className="text-center border-x border-gray-200 px-8">
            <div className="flex flex-col items-center">
              <Trophy className="w-6 h-6 text-fitgreen mb-1" />
              <span className="text-2xl font-bold">{profile?.achievements_count || 0}</span>
              <span className="text-xs text-gray-500">Conquistas</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-6 h-6 text-fitpurple mb-1" />
              <span className="text-2xl font-bold">{profile?.streak || 0}</span>
              <span className="text-xs text-gray-500">Sequência</span>
            </div>
          </div>
        </div>
        
        {/* Last workout */}
        <div className="mt-4 w-full text-center text-sm text-gray-500">
          <span>Último treino: {formattedLastWorkout}</span>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-lg font-bold mb-3">Conquistas Recentes</h3>
        
        {isLoadingAchievements ? (
          <div className="text-center py-4 text-gray-500">
            Carregando conquistas...
          </div>
        ) : userAchievements.length > 0 ? (
          userAchievements.slice(0, 3).map(achievement => (
            <Achievement 
              key={achievement.id}
              icon={<Award className="w-6 h-6 text-yellow-600" />}
              title={achievement.achievement?.name || "Conquista"}
              description={achievement.achievement?.description || ""}
              date={formatAchievementDate(achievement.achievedAt)}
              color="yellow"
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Complete treinos para desbloquear conquistas
          </div>
        )}
      </div>
      
      {/* Goals */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-lg font-bold mb-3">Metas em Andamento</h3>
        
        {goals.length > 0 ? (
          goals.map(goal => (
            <ProgressBar 
              key={goal.id}
              label={goal.label}
              current={goal.current}
              target={goal.target}
              colorClass={goal.colorClass}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Você ainda não tem metas definidas
          </div>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
