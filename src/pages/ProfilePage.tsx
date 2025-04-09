
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, LogOut, Dumbbell, Award, Shield, Clock, Flame, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import Trophy from '@/components/icons/Trophy';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import XPProgressBar from '@/components/profile/XPProgressBar';
import StatCard from '@/components/profile/StatCard';
import ClassCard from '@/components/profile/ClassCard';
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
    xpGain: '+25 XP',
    bonuses: [
      {
        description: 'XP em exercícios compostos agachamento, levantamento terra, supino',
        value: '+20%'
      },
      {
        description: 'XP em todos os exercícios de força',
        value: '+10%'
      }
    ]
  };
  
  // Mock recent achievements
  const recentAchievements = [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      name: '7 Dias Seguidos'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5 text-fitblue" />,
      name: '50 Treinos'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5 text-gray-400" />,
      name: 'Bloqueada',
      isLocked: true
    }
  ];
  
  // Default avatar if user doesn't have one
  const userAvatar = profile?.avatar_url || "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
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
      
      {/* User Profile Header */}
      <div className="bg-white p-6 relative">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden">
              <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-fitblue text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Award className="w-3 h-3 mr-1" /> {rpgData.level}
            </div>
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{profile?.name || user?.email}</h2>
                <p className="text-gray-600">@{profile?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
              </div>
            </div>
            
            {/* Class Button */}
            <div className="mt-2">
              <Button 
                className="bg-fitblue text-white rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto"
              >
                <Trophy className="w-4 h-4" /> {rpgData.className}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg">
          <StatCard 
            icon={<Dumbbell className="w-5 h-5 text-fitblue" />}
            value={profile?.workouts_count || 247}
            label="Treinos"
          />
          
          <div className="h-10 w-px bg-gray-200 my-auto"></div>
          
          <StatCard 
            icon={<Trophy className="w-5 h-5 text-fitpurple" />}
            value={`#${42}`}
            label="Ranking"
          />
        </div>
      </div>
      
      {/* XP Progress Section */}
      <div className="bg-white p-4 mt-2">
        <XPProgressBar
          current={rpgData.currentXP}
          total={rpgData.nextLevelXP}
          label={`Nível ${rpgData.level}`}
        />
        
        <XPProgressBar
          current={rpgData.dailyXP}
          total={rpgData.dailyXPCap}
          label="XP do Dia"
          className="bg-fitgreen"
        />
        
        <div className="flex justify-between text-sm mt-2">
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" /> 
            {rpgData.lastActivity}
          </div>
          
          <div className="text-fitgreen font-medium">
            {rpgData.xpGain}
          </div>
        </div>
      </div>
      
      {/* Streak & Achievements Summary */}
      <div className="bg-white p-4 mt-2 flex">
        <div className="flex-1 flex items-center justify-center p-3 border-r border-gray-100">
          <div className="bg-orange-100 p-2 rounded-full mr-3">
            <Flame className="text-orange-500 w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Streak</p>
            <p className="font-bold text-lg">{rpgData.streak} dias</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-3">
          <div className="bg-fitpurple-100 p-2 rounded-full mr-3">
            <Award className="text-fitpurple w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Conquistas</p>
            <p className="font-bold text-lg">{rpgData.achievements.unlocked}/{rpgData.achievements.total}</p>
          </div>
        </div>
      </div>
      
      {/* Class Section */}
      <div className="bg-white p-4 mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">Classe</h3>
          <Button variant="ghost" className="text-fitblue flex items-center text-sm h-auto p-0" onClick={() => navigate('/classes')}>
            Trocar Classe <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <ClassCard 
          className={rpgData.className}
          description={rpgData.classDescription}
          icon={<Shield className="w-5 h-5 text-white" />}
          bonuses={rpgData.bonuses}
        />
      </div>
      
      {/* Recent Achievements */}
      <div className="bg-white p-4 mt-2">
        <RecentAchievementsList achievements={recentAchievements} />
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
