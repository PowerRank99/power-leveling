
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { FilterIcon } from '@/components/icons/NavIcons';
import { Crown } from 'lucide-react';

const RankingDetailPage = () => {
  // Mock data
  const pixelAvatar1 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar2 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar3 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  const pixelAvatar4 = "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png";
  const pixelAvatar5 = "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  
  const rankingInfo = {
    title: "Desafio Força Total",
    period: "Semana 3 de 12"
  };
  
  const userScore = {
    points: 920,
    position: 1
  };
  
  const participants = [
    { id: "1", name: "Você", avatar: pixelAvatar1, points: 920, position: 1, isCurrentUser: true, badge: "Líder" },
    { id: "2", name: "João Silva", avatar: pixelAvatar2, points: 850, position: 2 },
    { id: "3", name: "Maria Santos", avatar: pixelAvatar3, points: 780, position: 3 },
    { id: "4", name: "Pedro Costa", avatar: pixelAvatar4, points: 720, position: 4 },
    { id: "5", name: "Ana Oliveira", avatar: pixelAvatar5, points: 690, position: 5 }
  ];
  
  const renderBadge = (badge: string | undefined) => {
    if (!badge) return null;
    
    return (
      <span className="inline-flex items-center ml-2 bg-fitblue text-white rounded-full px-3 py-1 text-xs">
        <Crown className="w-3 h-3 mr-1" />
        {badge}
      </span>
    );
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader title="Ranking Detalhado" />
      
      {/* Ranking Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-2xl font-bold text-center mb-2">{rankingInfo.title}</h2>
        <p className="text-gray-500 text-center">{rankingInfo.period}</p>
      </div>
      
      {/* User Score */}
      <div className="bg-blue-50 p-4 rounded-lg m-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-600">Sua Pontuação</p>
            <p className="text-3xl font-bold text-fitblue">{userScore.points} pts</p>
          </div>
          <div>
            <p className="text-gray-600 text-right">Posição</p>
            <p className="text-3xl font-bold text-fitblue text-right">#{userScore.position}</p>
          </div>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex justify-between items-center px-4 py-3">
        <h3 className="text-xl font-bold">Classificação</h3>
        
        <div className="flex space-x-3">
          <button className="flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white">
            <FilterIcon className="w-4 h-4 mr-1 text-gray-600" />
            <span className="text-sm">Filtrar</span>
          </button>
          
          <button className="flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white">
            <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="text-sm">Ordenar</span>
          </button>
        </div>
      </div>
      
      {/* Participants List */}
      <div className="px-4">
        {participants.map((user) => (
          <div 
            key={user.id} 
            className={`flex items-center p-4 rounded-lg mb-2 ${
              user.isCurrentUser ? 'bg-blue-50' : 'bg-white'
            } border border-gray-200`}
          >
            <div className="w-8 text-center mr-3">
              <span className={`text-lg font-bold ${
                user.position === 1 ? 'text-yellow-500' : 
                user.position === 2 ? 'text-gray-500' : 
                user.position === 3 ? 'text-orange-500' : 'text-gray-400'
              }`}>{user.position}</span>
            </div>
            
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center">
                <h4 className="font-bold">
                  {user.name}
                </h4>
                {renderBadge(user.badge)}
              </div>
              <p className="text-gray-500">{user.points} pontos</p>
            </div>
            
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default RankingDetailPage;
