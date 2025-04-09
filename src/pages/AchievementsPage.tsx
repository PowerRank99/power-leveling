
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Flame, Users, Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: React.ReactNode;
  iconBg: string;
  status: 'locked' | 'unlocked';
}

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  // Mock achievements data
  const achievements: Record<string, AchievementItem[]> = {
    treino: [
      {
        id: 'first_workout',
        title: 'Primeiro Treino',
        description: 'Complete seu primeiro treino',
        xpReward: 50,
        icon: <Dumbbell className="h-6 w-6 text-fitgreen-600" />,
        iconBg: 'bg-fitgreen-100',
        status: 'unlocked'
      },
      {
        id: 'streak_30',
        title: 'Mestre do Fogo',
        description: 'Complete 30 treinos seguidos',
        xpReward: 100,
        icon: <Flame className="h-6 w-6 text-orange-500" />,
        iconBg: 'bg-orange-100',
        status: 'locked'
      }
    ],
    guildas: [
      {
        id: 'first_guild',
        title: 'Primeira Guilda',
        description: 'Entre em sua primeira guilda',
        xpReward: 75,
        icon: <Users className="h-6 w-6 text-fitpurple-600" />,
        iconBg: 'bg-fitpurple-100',
        status: 'unlocked'
      },
      {
        id: 'guild_leader',
        title: 'Líder Supremo',
        description: 'Crie uma guilda com 50+ membros',
        xpReward: 200,
        icon: <Award className="h-6 w-6 text-gray-400" />,
        iconBg: 'bg-gray-100',
        status: 'locked'
      }
    ]
  };
  
  // Filter achievements based on selected filter
  const filterAchievements = (items: AchievementItem[]) => {
    if (filter === 'all') return items;
    return items.filter(item => item.status === filter);
  };
  
  // Count all achievements (unlocked/total)
  const countAchievements = () => {
    const allAchievements = [...achievements.treino, ...achievements.guildas];
    const unlockedCount = allAchievements.filter(a => a.status === 'unlocked').length;
    return `${unlockedCount}/${allAchievements.length}`;
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Conquistas" 
        showBackButton={true}
        rightContent={
          <div className="text-lg font-medium">{countAchievements()}</div>
        }
      />
      
      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3">
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={(value) => setFilter(value as any)}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all" className="rounded-full">Todas</TabsTrigger>
            <TabsTrigger value="unlocked" className="rounded-full">Desbloqueadas</TabsTrigger>
            <TabsTrigger value="locked" className="rounded-full">Bloqueadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Achievement Categories */}
      <div className="mt-4">
        {/* Training Achievements */}
        <div className="bg-white p-4 mb-4">
          <h3 className="text-xl font-bold mb-2">Treino</h3>
          
          {filterAchievements(achievements.treino).map(achievement => (
            <div key={achievement.id} className="flex items-center p-4 border-b border-gray-100 last:border-0">
              <div className={`${achievement.iconBg} w-14 h-14 rounded-full flex items-center justify-center mr-4`}>
                {achievement.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-bold text-base">{achievement.title}</h3>
                  <span className={`font-medium ${achievement.status === 'unlocked' ? 'text-fitgreen-600' : 'text-gray-400'}`}>
                    +{achievement.xpReward} XP
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{achievement.description}</p>
                
                {achievement.status === 'unlocked' ? (
                  <span className="inline-block mt-1 px-3 py-1 bg-fitgreen-100 text-fitgreen-600 text-xs rounded-full">
                    Desbloqueada
                  </span>
                ) : (
                  <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    Bloqueada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Guild Achievements */}
        <div className="bg-white p-4">
          <h3 className="text-xl font-bold mb-2">Guildas</h3>
          
          {filterAchievements(achievements.guildas).map(achievement => (
            <div key={achievement.id} className="flex items-center p-4 border-b border-gray-100 last:border-0">
              <div className={`${achievement.iconBg} w-14 h-14 rounded-full flex items-center justify-center mr-4`}>
                {achievement.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-bold text-base">{achievement.title}</h3>
                  <span className={`font-medium ${achievement.status === 'unlocked' ? 'text-fitgreen-600' : 'text-gray-400'}`}>
                    +{achievement.xpReward} XP
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{achievement.description}</p>
                
                {achievement.status === 'unlocked' ? (
                  <span className="inline-block mt-1 px-3 py-1 bg-fitgreen-100 text-fitgreen-600 text-xs rounded-full">
                    Desbloqueada
                  </span>
                ) : (
                  <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    Bloqueada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default AchievementsPage;
