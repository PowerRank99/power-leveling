
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Medal, Dumbbell, Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Achievement from '@/components/profile/Achievement';
import ProgressBar from '@/components/profile/ProgressBar';
import BottomNavBar from '@/components/navigation/BottomNavBar';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Mock data
  const userAvatar = "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
  const achievements = [
    {
      id: "1",
      title: "Mestre do Supino",
      description: "Superou 100kg no supino reto",
      icon: <Medal className="w-6 h-6 text-yellow-600" />,
      date: "Hoje",
      color: "yellow"
    },
    {
      id: "2",
      title: "Dedicação Total",
      description: "30 dias consecutivos de treino",
      icon: <Award className="w-6 h-6 text-purple-600" />,
      date: "3d",
      color: "purple"
    },
    {
      id: "3",
      title: "Peso Pesado",
      description: "Levantou 1000kg em um único treino",
      icon: <Dumbbell className="w-6 h-6 text-green-600" />,
      date: "1s",
      color: "green"
    }
  ];
  
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
      <PageHeader title="Conquistas" />
      
      {/* User Profile Header */}
      <div className="bg-white p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-lg overflow-hidden mb-2">
          <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
        
        <h2 className="text-xl font-bold">Maria Silva</h2>
        <p className="text-gray-600">Nível 42 - Guerreira do Ferro</p>
        
        {/* XP Progress */}
        <div className="w-full mt-4">
          <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
            <div className="h-full bg-fitblue w-3/4"></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>750/1000 XP para o próximo nível</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex w-full justify-between mt-6">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Dumbbell className="w-6 h-6 text-fitblue mb-1" />
              <span className="text-2xl font-bold">147</span>
              <span className="text-xs text-gray-500">Treinos</span>
            </div>
          </div>
          
          <div className="text-center border-x border-gray-200 px-8">
            <div className="flex flex-col items-center">
              <Trophy className="w-6 h-6 text-fitgreen mb-1" />
              <span className="text-2xl font-bold">28</span>
              <span className="text-xs text-gray-500">Conquistas</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Award className="w-6 h-6 text-fitpurple mb-1" />
              <span className="text-2xl font-bold">12</span>
              <span className="text-xs text-gray-500">Recordes</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-lg font-bold mb-3">Conquistas Recentes</h3>
        
        {achievements.map(achievement => (
          <Achievement 
            key={achievement.id}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
            date={achievement.date}
            color={achievement.color as 'blue' | 'green' | 'purple' | 'yellow'}
          />
        ))}
      </div>
      
      {/* Goals */}
      <div className="mt-4 bg-white p-4">
        <h3 className="text-lg font-bold mb-3">Metas em Andamento</h3>
        
        {goals.map(goal => (
          <ProgressBar 
            key={goal.id}
            label={goal.label}
            current={goal.current}
            target={goal.target}
            colorClass={goal.colorClass}
          />
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
